import type { AnswerValue } from "@/types/assessment";

/*
 * Career Discovery — types.
 *
 * v2 architecture: answers → dimensions → catalog careers, instead of
 * answers → a hand-picked list of careers. Two dimension layers:
 *
 *  - FieldId: 9 broad worlds, each a grouping of the *real* categories that
 *    already exist in `lib/careers/catalog.ts` (119 careers, 15 categories).
 *    Questions assign weight to fields. This is what lets the assessment
 *    recommend a Doctor, Lawyer, or Teacher instead of only tech roles.
 *  - TraitId: 11 cross-cutting work-style traits. Every catalog career's
 *    trait vector is *derived* from its existing category/skills/description
 *    (see `traits.ts`) — never hand-authored per career — so scoring covers
 *    all 119 careers (and any added later) for free.
 *
 * A career's match score = field alignment (which world) + trait alignment
 * (which specific career within that world fits your working style).
 */

export type { AnswerValue };

/** Raw answers keyed by question id, same wire shape as the rest of the app. */
export type DiscoveryAnswers = Record<string, AnswerValue>;

/** The 9 broad career worlds — each maps to one or more real catalog categories. */
export type FieldId =
  | "technology"
  | "healthcare"
  | "engineering"
  | "business"
  | "law_public"
  | "education"
  | "design_creative"
  | "media_communication"
  | "science";

/** 11 cross-cutting work-style traits used to differentiate careers within a field. */
export type TraitId =
  | "analytical"
  | "creative"
  | "peopleHelping"
  | "technical"
  | "businessAcumen"
  | "communication"
  | "leadership"
  | "independence"
  | "structure"
  | "riskTolerance"
  | "responsibility";

export type FieldWeights = Partial<Record<FieldId, number>>;
export type TraitWeights = Partial<Record<TraitId, number>>;

export interface DiscoveryOption {
  value: string;
  label: string;
  description?: string;
  icon?: string;
  /** How much selecting this option nudges each broad field. */
  fieldWeights?: FieldWeights;
  /** How much selecting this option nudges each work-style trait. */
  traitWeights?: TraitWeights;
}

export type DiscoveryQuestionType = "single" | "multi";

export interface DiscoveryQuestion {
  id: string;
  title: string;
  helpText?: string;
  type: DiscoveryQuestionType;
  /** multi: min / max selectable. */
  min?: number;
  max?: number;
  /** Renders as searchable chips instead of cards — used for the organizations question. */
  searchable?: boolean;
  options: DiscoveryOption[];
  /**
   * When set, `options` above is empty and the question's real title/options
   * are resolved at render time based on the student's field answer so far
   * (e.g. hospitals for Healthcare, law firms for Law & Public).
   */
  dynamicSource?: "organizations";
  /** Which trait area this question probes — advanced assessment only. */
  trait?: AdvancedTrait;
}

export type AdvancedTrait =
  | "Problem Solving"
  | "Leadership"
  | "Communication"
  | "Creativity"
  | "Decision Making"
  | "Adaptability"
  | "Learning Behaviour"
  | "Career Values"
  | "Teamwork"
  | "Risk Taking"
  | "Curiosity"
  | "Critical Thinking"
  | "Goal Orientation"
  | "Technical Interest"
  | "Business Interest"
  | "Innovation"
  | "Confidence"
  | "Time Management"
  | "Self Management";

export interface FieldDefinition {
  id: FieldId;
  label: string;
  /** The real `Career.category` values (from lib/careers/catalog.ts) this field covers. */
  categories: string[];
}

export interface CareerMatch {
  /** The catalog slug — every result is a real career from lib/careers/catalog.ts. */
  id: string;
  title: string;
  category: string;
  catalogSlug: string;
  fieldId: FieldId;
  fieldLabel: string;
  /** 0–99. A shared, comparable scale — NOT relative to the student's own ceiling. */
  matchPercent: number;
  /** Plain-language explanation generated from the user's actual answers + the career's own description. */
  explanation: string;
  /** The specific answer labels that drove this recommendation. */
  drivers: string[];
}

export interface DiscoveryResult {
  top: CareerMatch[];
  all: CareerMatch[];
  /** The field the student's answers pointed to most strongly. */
  topField: { id: FieldId; label: string; percent: number };
}
