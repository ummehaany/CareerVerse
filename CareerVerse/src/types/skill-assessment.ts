import type { FirestoreTimestamp } from "./user";

export const SKILL_ASSESSMENT_VERSION = 1;

export type SkillProficiency = "beginner" | "intermediate" | "advanced";

export interface SavedSkill {
  name: string;
  proficiency: SkillProficiency;
}

/** `users/{uid}/skillAssessments/{id}` — a saved skill-gap snapshot. */
export interface SkillAssessmentDoc {
  id: string;
  careerSlug: string;
  careerTitle: string;
  skills: SavedSkill[];
  readinessScore: number;
  masteredCount: number;
  partialCount: number;
  missingCount: number;
  totalRequired: number;
  schemaVersion: number;
  createdAt: FirestoreTimestamp | null;
}
