import { z } from "zod";
import type { StructuredProfile } from "@/types/assessment";
import type { CareerRecommendation } from "@/types/recommendation";
import type { CareerMatch } from "@/features/assessment/discovery/types";
import type { TokenUsage } from "../types";
import { getAIProvider } from "../index";
import { guardProfile, dedupeTrim, sanitizeRecommendations } from "../guardrails";
import {
  buildPersonalizationSystemPrompt,
  buildPersonalizationUserPrompt,
} from "../prompts/career-recommendation";

/*
 * AI personalization layer for Career Discovery's Top-N result.
 *
 * This is deliberately NOT a "pick careers" or "score careers" function.
 * Career Discovery's deterministic field+trait scoring engine
 * (`features/assessment/discovery/scoring.ts`) is this product's single
 * source of truth for which careers a user is shown and at what
 * percentage — `lib/ai/services/recommendation-fallback.ts` builds the base
 * `CareerRecommendation[]` directly from that engine's own ranked output.
 * All this module does is optionally ask the model to rewrite the *wording*
 * of a few narrative fields (why it matches, and light refinements to the
 * strengths/skills/opportunities lists) for a FIXED list of already-decided
 * careers, addressed only by array index.
 *
 * The response schema below has no "title" or "matchPercentage" field at
 * all — structurally, the model has no slot in which to name a different
 * career or change a score. `personalizeRecommendations` further validates
 * every returned `index` against the known range and silently drops
 * anything out of bounds or duplicated before merging, so even a
 * malformed/adversarial model response can only ever affect wording, never
 * which careers appear.
 */

const personalizationItemSchema = z.object({
  index: z.number().int().min(0),
  whyItMatches: z.string().min(1),
  strengthsIdentified: z.array(z.string()).optional(),
  skillsToImprove: z.array(z.string()).optional(),
  futureOpportunities: z.array(z.string()).optional(),
});

const personalizationSetSchema = z.object({
  personalizations: z.array(personalizationItemSchema).min(1),
});

// Gemini-native response schema (drives structured decoding on the provider).
// Note there is intentionally no "title" or "matchPercentage" property here.
const RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "OBJECT",
  properties: {
    personalizations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          index: { type: "INTEGER" },
          whyItMatches: { type: "STRING" },
          strengthsIdentified: { type: "ARRAY", items: { type: "STRING" } },
          skillsToImprove: { type: "ARRAY", items: { type: "STRING" } },
          futureOpportunities: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["index", "whyItMatches"],
      },
    },
  },
  required: ["personalizations"],
};

export interface PersonalizeResult {
  /** `base`, with any valid per-index personalization merged in. Same length/order/titles as `base`. */
  recommendations: CareerRecommendation[];
  provider: string;
  model: string;
  usage: TokenUsage;
  /** How many of the `base.length` careers actually received a personalized rewrite. */
  personalizedCount: number;
}

/**
 * Personalize the wording of an already-fixed, already-scored set of career
 * recommendations. `base` and `matches` must be the same length and in the
 * same order (both produced from the same `scoreCareerDiscovery` call).
 */
export async function personalizeRecommendations(
  base: CareerRecommendation[],
  matches: CareerMatch[],
  profile: StructuredProfile,
  displayName?: string | null,
  memoryContext?: string,
): Promise<PersonalizeResult> {
  guardProfile(profile);

  const provider = getAIProvider();
  const { data, usage } = await provider.generateObject(personalizationSetSchema, {
    system: buildPersonalizationSystemPrompt(),
    prompt:
      buildPersonalizationUserPrompt(base, matches, profile, displayName) +
      (memoryContext ? `\n\n${memoryContext}` : ""),
    temperature: 0.5,
    maxOutputTokens: 4000,
    responseSchema: RESPONSE_SCHEMA,
  });

  const merged = base.map((rec) => ({ ...rec }));
  const seen = new Set<number>();
  let personalizedCount = 0;

  for (const item of data.personalizations) {
    // Defense in depth: even though the schema has no title/score field,
    // still hard-guard the index against the known, fixed career list.
    if (!Number.isInteger(item.index) || item.index < 0 || item.index >= merged.length) continue;
    if (seen.has(item.index)) continue;
    seen.add(item.index);

    const target = merged[item.index]!;
    const whyItMatches = item.whyItMatches.trim();
    if (whyItMatches) target.whyItMatches = whyItMatches;
    if (item.strengthsIdentified?.length) target.strengthsIdentified = dedupeTrim(item.strengthsIdentified);
    if (item.skillsToImprove?.length) target.skillsToImprove = dedupeTrim(item.skillsToImprove);
    if (item.futureOpportunities?.length) target.futureOpportunities = dedupeTrim(item.futureOpportunities);
    personalizedCount++;
  }

  return {
    recommendations: sanitizeRecommendations(merged),
    provider: provider.name,
    model: provider.model,
    usage,
    personalizedCount,
  };
}
