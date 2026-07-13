import type { Answers, AnswerValue, AssessmentStatus } from "@/types/assessment";

export type QuestionType = "single" | "multi" | "scale" | "text" | "longtext";

export type SectionId =
  | "interests"
  | "education"
  | "technical"
  | "soft"
  | "strengths"
  | "personality"
  | "workstyle"
  | "values"
  | "leadership"
  | "goals";

export interface Option {
  value: string;
  label: string;
  description?: string;
  /** Key into the assessment icon registry (see components/option-icon). */
  icon?: string;
}

export interface ScaleConfig {
  min: number;
  max: number;
  minLabel: string;
  maxLabel: string;
}

export interface Question {
  id: string;
  section: SectionId;
  type: QuestionType;
  title: string;
  helpText?: string;
  required: boolean;
  options?: Option[];
  /** How option-based questions render. Defaults by option count. */
  display?: "cards" | "chips";
  /** multi: min / max selectable. */
  min?: number;
  max?: number;
  scale?: ScaleConfig;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
}

export interface Section {
  id: SectionId;
  title: string;
  subtitle: string;
  /** Key into the assessment icon registry. */
  icon: string;
}

/** Serializable draft handed from the server component to the client flow. */
export interface AssessmentDraftView {
  id: string;
  status: AssessmentStatus;
  currentStep: number;
  answers: Answers;
}

export type { Answers, AnswerValue };
