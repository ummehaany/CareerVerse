import type { Answers, StructuredProfile } from "@/types/assessment";
import type { DimensionId, DimensionScores } from "./types";
import { emptyScores } from "./dimensions";
import { QUESTIONS_BY_ID } from "../questions";

/*
 * Weighted scoring engine. Projects a StructuredProfile onto the 15 dimensions.
 *
 * Two layers of evidence:
 *  1. Keyword + self-rating base — derived from the user's own interests,
 *     skills, strengths, values, and personality choices, blended with the
 *     self-rated scales. Robust to question-set changes.
 *  2. Option weights (optional) — when the raw answers are supplied, the
 *     per-option `weights` authored in the question bank refine each dimension
 *     the user's specific choices emphasize. Only dimensions with option
 *     evidence are blended, so keyword-only dimensions keep their base score.
 *
 * Pure and deterministic; no single answer decides a dimension on its own.
 */

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, n));
}
function to100(n: number): number {
  return Math.round(clamp(n));
}
/** Normalize a 1–5 self-rating to 0..1. */
function scale01(v: number | null): number {
  if (typeof v !== "number") return 0.5;
  return clamp((v - 1) / 4, 0, 1);
}

/** Sum the per-option dimension weights across every selected answer. */
function optionWeightEvidence(answers: Answers): { nudge: DimensionScores; touched: Set<DimensionId> } {
  const nudge = emptyScores();
  const touched = new Set<DimensionId>();

  for (const [questionId, value] of Object.entries(answers)) {
    const question = QUESTIONS_BY_ID[questionId];
    if (!question?.options) continue;

    const selected: string[] = Array.isArray(value)
      ? value
      : typeof value === "string" && value
        ? [value]
        : [];

    for (const optionValue of selected) {
      const option = question.options.find((o) => o.value === optionValue);
      if (!option?.weights) continue;
      (Object.keys(option.weights) as DimensionId[]).forEach((d) => {
        const w = option.weights![d];
        if (typeof w === "number") {
          nudge[d] += w;
          touched.add(d);
        }
      });
    }
  }

  return { nudge, touched };
}

export function computeDimensionScores(p: StructuredProfile, answers?: Answers): DimensionScores {
  const s = emptyScores();

  const signalText = [
    ...p.interests,
    ...p.workActivities,
    ...p.technicalSkills,
    ...p.softSkills,
    ...p.strengths,
    ...p.values,
    ...p.learningPreferences,
    p.industryDirection,
    p.primaryMotivator,
    p.personality.socialEnergy,
    p.personality.decisionStyle,
    p.personality.structurePreference,
    p.workStyle.collaboration,
    p.workStyle.environment,
    p.workStyle.pace,
    p.leadership.teamRole,
    p.problemSolving.approach,
  ]
    .filter((v): v is string => Boolean(v))
    .join(" | ")
    .toLowerCase();

  const hits = (words: string[]): number => words.reduce((n, w) => n + (signalText.includes(w) ? 1 : 0), 0);

  s.interests = to100(40 + p.interests.length * 7 + p.workActivities.length * 4);

  s.technicalInclination = to100(
    hits(["tech", "software", "engineer", "data", "coding", "program", "system", "cloud", "develop", "computer", "ai", "cyber"]) * 10 +
      scale01(p.technicalProficiency) * 55 +
      p.technicalSkills.length * 4,
  );

  s.creativity = to100(
    hits(["design", "art", "creative", "writing", "content", "media", "innovat", "story", "brand", "ux"]) * 11 +
      scale01(p.problemSolving.creativity) * 55 +
      (/(intuiti|creativ|imaginat)/.test(signalText) ? 15 : 0),
  );

  s.leadership = to100(
    hits(["lead", "manage", "mentor", "direct", "drive", "own", "strateg"]) * 10 +
      scale01(p.leadership.interest) * 60 +
      (/(lead|driver|initiat)/.test(p.leadership.teamRole?.toLowerCase() ?? "") ? 15 : 0),
  );

  s.communication = to100(
    hits(["communicat", "writing", "present", "teach", "social", "collaborat", "storytelling", "public"]) * 9 +
      scale01(p.communicationConfidence) * 55 +
      (/(outgoing|extrovert|energ)/.test(p.personality.socialEnergy?.toLowerCase() ?? "") ? 15 : 0),
  );

  s.problemSolving = to100(
    hits(["problem", "research", "troubleshoot", "build", "analy", "solve", "debug", "engineer"]) * 9 +
      45 +
      (/(systemat|logic|method|experiment)/.test(p.problemSolving.approach?.toLowerCase() ?? "") ? 20 : 0),
  );

  s.analyticalThinking = to100(
    hits(["data", "analy", "research", "finance", "science", "statistic", "logic", "math", "metrics"]) * 11 +
      35 +
      (/(analytic|logic|data|rational)/.test(p.personality.decisionStyle?.toLowerCase() ?? "") ? 20 : 0),
  );

  s.learningStyle = to100(30 + scale01(p.learningAgility) * 55 + p.learningPreferences.length * 6);

  s.riskTolerance = to100(
    35 +
      (/(flexible|spontan|adapt|change|ambig)/.test(signalText) ? 20 : 0) +
      (/(fast|dynamic|rapid)/.test(p.workStyle.pace?.toLowerCase() ?? "") ? 18 : 0) +
      hits(["startup", "entrepreneur", "independent", "risk", "bold"]) * 8,
  );

  s.collaboration = to100(
    hits(["help", "team", "collaborat", "social", "support", "people", "community"]) * 10 +
      (/(team|together|group|collaborat)/.test(p.workStyle.collaboration?.toLowerCase() ?? "") ? 25 : 0) +
      (/(outgoing|extrovert)/.test(p.personality.socialEnergy?.toLowerCase() ?? "") ? 15 : 0) +
      35,
  );

  s.independence = to100(
    35 +
      (/(independ|autonom|solo|self)/.test(p.workStyle.collaboration?.toLowerCase() ?? "") ? 30 : 0) +
      (/(reserved|introvert|quiet|focus)/.test(p.personality.socialEnergy?.toLowerCase() ?? "") ? 18 : 0) +
      hits(["independent", "autonomy", "self-directed"]) * 8,
  );

  s.motivation = to100(30 + scale01(p.selfMotivation) * 55 + (p.goals.aspiration ? 10 : 0) + (p.primaryMotivator ? 8 : 0));

  s.careerValues = to100(40 + p.values.length * 12);

  s.workPreferences = to100(
    35 +
      (p.workStyle.collaboration ? 12 : 0) +
      (p.workStyle.environment ? 12 : 0) +
      (p.workStyle.pace ? 12 : 0) +
      (p.industryDirection ? 12 : 0),
  );

  s.personality = to100(
    35 +
      (p.personality.socialEnergy ? 15 : 0) +
      (p.personality.decisionStyle ? 15 : 0) +
      (p.personality.structurePreference ? 15 : 0),
  );

  // Layer 2 — refine with option-weight evidence when raw answers are supplied.
  if (!answers) return s;

  const { nudge, touched } = optionWeightEvidence(answers);
  const blended = emptyScores();
  (Object.keys(s) as DimensionId[]).forEach((d) => {
    if (touched.has(d)) {
      const evidence = clamp(50 + nudge[d]); // option evidence on a 0–100 scale
      blended[d] = to100(s[d] * 0.5 + evidence * 0.5);
    } else {
      blended[d] = s[d];
    }
  });
  return blended;
}
