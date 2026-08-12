import type { FirestoreTimestamp } from "./user";

export const INTERVIEW_VERSION = 1;

export type InterviewDifficulty = "junior" | "mid" | "senior";

export type InterviewType = "hr" | "technical" | "behavioral" | "case-study" | "group-discussion";

export interface InterviewQuestion {
  id: string;
  question: string;
  focusArea: string;
}

export interface InterviewAnswer {
  questionId: string;
  answer: string;
}

export interface InterviewEvaluationItem {
  questionId: string;
  /** 0–10 for the individual answer. */
  score: number;
  feedback: string;
}

/** Skill dimensions, each 0–100. Optional for backward-compatibility. */
export interface InterviewDimensions {
  communication: number;
  confidence: number;
  technical: number;
  problemSolving: number;
}

export interface InterviewEvaluation {
  items: InterviewEvaluationItem[];
  /** 0–100 overall. */
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  dimensions?: InterviewDimensions;
  nextSteps?: string[];
}

/** `users/{uid}/interviews/{id}` — one completed mock interview. */
export interface InterviewDoc {
  id: string;
  role: string;
  /** Interview type (optional for older docs). */
  type?: InterviewType;
  difficulty: InterviewDifficulty;
  provider: string;
  model: string;
  schemaVersion: number;
  questions: InterviewQuestion[];
  answers: InterviewAnswer[];
  evaluation: InterviewEvaluation | null;
  status: "completed";
  createdAt: FirestoreTimestamp | null;
}
