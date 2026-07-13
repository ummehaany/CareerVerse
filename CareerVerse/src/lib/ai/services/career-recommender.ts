import { z } from "zod";
import type { StructuredProfile } from "@/types/assessment";
import type { CareerRecommendation } from "@/types/recommendation";
import type { TokenUsage } from "../types";
import { getAIProvider } from "../index";
import { guardProfile, sanitizeRecommendations } from "../guardrails";
import {
  buildRecommendationSystemPrompt,
  buildRecommendationUserPrompt,
} from "../prompts/career-recommendation";

// Zod schema the model output is validated against. Structurally identical to
// the persisted CareerRecommendation type.
const careerRecommendationSchema = z.object({
  title: z.string().min(1),
  matchPercentage: z.number().min(0).max(100),
  overview: z.string().min(1),
  whyItMatches: z.string().min(1),
  strengthsIdentified: z.array(z.string()).min(1),
  skillsToImprove: z.array(z.string()).min(1),
  salaryRange: z.object({
    currency: z.string().min(1),
    min: z.number().nonnegative(),
    max: z.number().nonnegative(),
    period: z.string().min(1),
  }),
  industryGrowth: z.object({
    outlook: z.string().min(1),
    summary: z.string().min(1),
  }),
  requiredEducation: z.string().min(1),
  recommendedCertifications: z.array(z.string()),
  futureOpportunities: z.array(z.string()).min(1),
});

const recommendationSetSchema = z.object({
  recommendations: z.array(careerRecommendationSchema).min(1).max(8),
});

// Gemini-native response schema (drives structured decoding on the provider).
const RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "OBJECT",
  properties: {
    recommendations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          matchPercentage: { type: "NUMBER" },
          overview: { type: "STRING" },
          whyItMatches: { type: "STRING" },
          strengthsIdentified: { type: "ARRAY", items: { type: "STRING" } },
          skillsToImprove: { type: "ARRAY", items: { type: "STRING" } },
          salaryRange: {
            type: "OBJECT",
            properties: {
              currency: { type: "STRING" },
              min: { type: "NUMBER" },
              max: { type: "NUMBER" },
              period: { type: "STRING" },
            },
            required: ["currency", "min", "max", "period"],
          },
          industryGrowth: {
            type: "OBJECT",
            properties: {
              outlook: { type: "STRING" },
              summary: { type: "STRING" },
            },
            required: ["outlook", "summary"],
          },
          requiredEducation: { type: "STRING" },
          recommendedCertifications: { type: "ARRAY", items: { type: "STRING" } },
          futureOpportunities: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: [
          "title",
          "matchPercentage",
          "overview",
          "whyItMatches",
          "strengthsIdentified",
          "skillsToImprove",
          "salaryRange",
          "industryGrowth",
          "requiredEducation",
          "recommendedCertifications",
          "futureOpportunities",
        ],
      },
    },
  },
  required: ["recommendations"],
};

export interface RecommenderResult {
  recommendations: CareerRecommendation[];
  provider: string;
  model: string;
  usage: TokenUsage;
}

/**
 * Analyze a completed assessment's structured profile and produce the Top 5
 * career recommendations. Provider-agnostic: it composes a versioned prompt, a
 * typed output schema, and whichever provider the factory returns.
 */
export async function recommendCareers(
  profile: StructuredProfile,
  displayName?: string | null,
): Promise<RecommenderResult> {
  guardProfile(profile);

  const provider = getAIProvider();
  const { data, usage } = await provider.generateObject(recommendationSetSchema, {
    system: buildRecommendationSystemPrompt(),
    prompt: buildRecommendationUserPrompt(profile, displayName),
    temperature: 0.65,
    maxOutputTokens: 6000,
    responseSchema: RESPONSE_SCHEMA,
  });

  const recommendations = sanitizeRecommendations(data.recommendations).slice(0, 5);

  return {
    recommendations,
    provider: provider.name,
    model: provider.model,
    usage,
  };
}
