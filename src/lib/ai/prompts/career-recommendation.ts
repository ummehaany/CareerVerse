import type { StructuredProfile } from "@/types/assessment";
import type { CareerRecommendation } from "@/types/recommendation";
import type { CareerMatch } from "@/features/assessment/discovery/types";

/** Version the prompt so stored output stays interpretable over time. */
export const RECOMMENDATION_PROMPT_VERSION = 2;

/*
 * v2: the AI no longer picks careers or scores. Career Discovery's own
 * deterministic field+trait engine (`scoring.ts`) has already decided the
 * Top N careers and their match percentages by the time this prompt runs —
 * this prompt's only job is to personalize the wording of a few narrative
 * fields for careers that are already fixed. There is no "title" or
 * "matchPercentage" field anywhere in the response schema the model fills
 * out, so it has no mechanism to introduce a different or unrelated career.
 */
export function buildPersonalizationSystemPrompt(): string {
  return [
    "You are an expert career counselor personalizing an already-decided set of career matches.",
    "A deterministic matching engine — not you — has already selected these exact careers and computed their match percentages. You do not choose careers, add careers, remove careers, reorder them, or change any score.",
    "",
    "You will be given a numbered list of careers (index 0, 1, 2, ...). For EACH numbered career, return exactly one personalization object carrying that same `index`. Never invent an index outside the given range, never omit one, never introduce any field that names a different career.",
    "",
    "Rules:",
    "- 'whyItMatches' should be warmer, more specific, and more personal than the machine-generated reasoning provided for that career — but grounded ONLY in the candidate profile signals given below. Do not invent facts about the person. Do not mention or imply any career other than the one at that index.",
    "- 'strengthsIdentified', 'skillsToImprove', and 'futureOpportunities' are optional refinements of the defaults already provided for that career — include a field only if you can meaningfully personalize it using the candidate's actual profile; omit it to keep the existing default.",
    "- Be specific, realistic, and encouraging. Avoid hype and generic filler.",
    "- Output ONLY JSON that conforms to the provided schema. No prose, no markdown, no extra fields.",
  ].join("\n");
}

function list(label: string, values: string[]): string | null {
  return values.length ? `${label}: ${values.join(", ")}` : null;
}

function scale(label: string, value: number | null): string | null {
  return value === null ? null : `${label}: ${value}/5`;
}

function cap(text: string | null, max = 500): string | null {
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

/** One block per already-matched career: index, fixed title/score, and the deterministic reasoning to build on. */
function careerBlock(index: number, rec: CareerRecommendation, match: CareerMatch | undefined): string {
  return [
    `[${index}] ${rec.title} — ${rec.matchPercentage}% match (fixed — do not change)`,
    match ? `Computed reasoning: ${match.explanation}` : null,
    match?.drivers.length ? `Key answer drivers: ${match.drivers.join(", ")}` : null,
    `Current strengthsIdentified: ${rec.strengthsIdentified.join(", ")}`,
    `Current skillsToImprove: ${rec.skillsToImprove.join(", ")}`,
  ]
    .filter((l): l is string => Boolean(l))
    .join("\n");
}

export function buildPersonalizationUserPrompt(
  base: CareerRecommendation[],
  matches: CareerMatch[],
  profile: StructuredProfile,
  displayName?: string | null,
): string {
  const careerLines = base.map((rec, i) => careerBlock(i, rec, matches[i])).join("\n\n");

  const lines: Array<string | null> = [
    displayName ? `Candidate: ${displayName}` : null,
    "",
    "== Already-matched careers (fixed — personalize wording only) ==",
    careerLines,
    "",
    "== Candidate profile (use only this for personalization) ==",
    list("Interest areas", profile.interests),
    list("Energizing activities", profile.workActivities),
    profile.industryDirection ? `Preferred direction: ${profile.industryDirection}` : null,
    profile.education.level ? `Education level: ${profile.education.level}` : null,
    profile.education.field ? `Field of study: ${profile.education.field}` : null,
    profile.education.status ? `Current status: ${profile.education.status}` : null,
    list("Technical skills", profile.technicalSkills),
    scale("Technical confidence", profile.technicalProficiency),
    scale("Learning agility", profile.learningAgility),
    list("Soft skills", profile.softSkills),
    scale("Communication confidence", profile.communicationConfidence),
    list("Strengths", profile.strengths),
    list("Growth areas", profile.growthAreas),
    scale("Self-motivation", profile.selfMotivation),
    profile.personality.socialEnergy ? `Social energy: ${profile.personality.socialEnergy}` : null,
    profile.personality.decisionStyle ? `Decision style: ${profile.personality.decisionStyle}` : null,
    profile.personality.structurePreference ? `Structure preference: ${profile.personality.structurePreference}` : null,
    profile.workStyle.collaboration ? `Collaboration: ${profile.workStyle.collaboration}` : null,
    profile.workStyle.environment ? `Environment: ${profile.workStyle.environment}` : null,
    profile.workStyle.pace ? `Pace: ${profile.workStyle.pace}` : null,
    list("Career values", profile.values),
    profile.primaryMotivator ? `Primary motivator: ${profile.primaryMotivator}` : null,
    scale("Leadership interest", profile.leadership.interest),
    profile.leadership.teamRole ? `Natural team role: ${profile.leadership.teamRole}` : null,
    profile.problemSolving.approach ? `Problem-solving approach: ${profile.problemSolving.approach}` : null,
    scale("Creativity preference", profile.problemSolving.creativity),
    list("Learning preferences", profile.learningPreferences),
    profile.goals.horizon ? `Focus: ${profile.goals.horizon}` : null,
    cap(profile.goals.aspiration) ? `Aspiration: ${cap(profile.goals.aspiration)}` : null,
    "",
    `Return one personalization object per numbered career above (indices 0–${base.length - 1}) as JSON.`,
  ];

  return lines.filter((line) => line !== null).join("\n");
}
