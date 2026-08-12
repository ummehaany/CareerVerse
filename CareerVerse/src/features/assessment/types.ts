import type { Answers, AnswerValue, AssessmentStatus } from "@/types/assessment";
import type { DimensionId } from "./engine/types";

export type QuestionType = "single" | "multi" | "scale" | "text" | "longtext";

export type SectionId =
  | "personality"
  | "interests"
  | "problemsolving"
  | "learning"
  | "communication"
  | "motivation"
  | "strengths"
  | "goals";

/** Weighted contribution an answer makes toward the 15 scoring dimensions. */
export type DimensionWeights = Partial<Record<DimensionId, number>>;

export interface Option {
  value: string;
  label: string;
  description?: string;
  /** Key into the assessment icon registry (see components/option-icon). */
  icon?: string;
  /**
   * How much selecting this option contributes to each scoring dimension.
   * Consumed by the scoring engine; ignored by normalization (which only reads
   * the direct-capture questions). Optional so plain questions stay simple.
   */
  weights?: DimensionWeights;
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
  /**
   * Marks questions that exist purely to enrich dimension scoring (new in the
   * weighted redesign). They are never read by buildStructuredProfile, so the
   * downstream StructuredProfile contract is unaffected.
   */
  scoringOnly?: boolean;
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
