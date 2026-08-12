/**
 * Canonical Skill Gap "prerequisite" state — the single definition every
 * surface that recommends or gates Skill Gap Analysis should read from
 * (dashboard recommendations, the Skill Gap page itself). Nothing here
 * blocks access: the page always works standalone (pick a career, add
 * skills, analyze). This only governs what CareerVerse proactively
 * *suggests* and what prerequisite messaging is shown, so every surface
 * agrees on the same state instead of drifting independently.
 *
 * The threshold — Career Discovery complete *and* at least one career match
 * generated — mirrors the Skill Gap page's own default-career-selection
 * logic (`getSkillGapPageData`), which only has a personalized career to
 * default to once recommendations exist; before that it falls back to an
 * arbitrary catalog entry.
 */
export type SkillGapReadiness = "not-ready" | "available" | "completed";

export interface SkillGapReadinessInput {
  /** Career Discovery completed. */
  onboardingComplete: boolean;
  /** Number of generated career matches (Career Discovery output). */
  recommendationsCount: number;
  /** Whether the student already has at least one saved Skill Gap result. */
  hasHistory: boolean;
}

export function getSkillGapReadiness({
  onboardingComplete,
  recommendationsCount,
  hasHistory,
}: SkillGapReadinessInput): SkillGapReadiness {
  // Existing results always take priority — never show a "get started"
  // prompt to someone who has already used the feature.
  if (hasHistory) return "completed";
  return onboardingComplete && recommendationsCount > 0 ? "available" : "not-ready";
}
