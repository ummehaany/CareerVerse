import type { FirestoreTimestamp } from "./user";

/** Bump when the question set changes so stored attempts stay interpretable. */
export const ASSESSMENT_VERSION = 1;

/** A single answer value. Multi-selects are string[]; scales are number. */
export type AnswerValue = string | string[] | number;

/** Raw answers keyed by question id — ideal for partial save + resume. */
export type Answers = Record<string, AnswerValue>;

export type AssessmentStatus = "in_progress" | "completed";

/**
 * Normalized, human-readable projection of the raw answers. This is the
 * AI-ready surface: the Phase 4 AI engine reads `structured` (or the raw
 * `answers`) to generate career recommendations, roadmaps, resume suggestions,
 * and interview plans. No AI is generated in this phase — this is derived
 * deterministically from the user's own responses.
 */
export interface StructuredProfile {
  interests: string[];
  workActivities: string[];
  industryDirection: string | null;
  education: {
    level: string | null;
    field: string | null;
    status: string | null;
  };
  technicalSkills: string[];
  technicalProficiency: number | null;
  learningAgility: number | null;
  softSkills: string[];
  communicationConfidence: number | null;
  strengths: string[];
  growthAreas: string[];
  selfMotivation: number | null;
  personality: {
    socialEnergy: string | null;
    decisionStyle: string | null;
    structurePreference: string | null;
  };
  workStyle: {
    collaboration: string | null;
    environment: string | null;
    pace: string | null;
  };
  values: string[];
  primaryMotivator: string | null;
  leadership: {
    interest: number | null;
    teamRole: string | null;
  };
  problemSolving: {
    approach: string | null;
    creativity: number | null;
  };
  learningPreferences: string[];
  goals: {
    horizon: string | null;
    targetRoles: string[];
    aspiration: string | null;
  };
}

/** `users/{uid}/assessments/{id}` — one assessment attempt (+ reserved AI slot). */
export interface AssessmentDoc {
  id: string;
  type: "onboarding";
  schemaVersion: number;
  status: AssessmentStatus;
  /** Resume pointer — the section index the user last viewed. */
  currentStep: number;
  answers: Answers;
  completionPercent: number;
  /** Populated on completion; consumed by the AI engine in a later phase. */
  structured: StructuredProfile | null;
  /** Reserved for the Phase 4 AI analyzer. Never written in this phase. */
  aiCareerProfile: null;
  startedAt: FirestoreTimestamp | null;
  updatedAt: FirestoreTimestamp | null;
  completedAt: FirestoreTimestamp | null;
}
