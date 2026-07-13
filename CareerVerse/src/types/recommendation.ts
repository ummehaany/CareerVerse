import type { FirestoreTimestamp } from "./user";

/** Bump when the recommendation shape changes. */
export const RECOMMENDATION_VERSION = 1;

export interface SalaryRange {
  currency: string;
  min: number;
  max: number;
  /** e.g. "year" | "month". */
  period: string;
}

export interface IndustryGrowth {
  /** Short label, e.g. "Strong", "Above average", "Stable". */
  outlook: string;
  summary: string;
}

export interface CareerRecommendation {
  title: string;
  /** 0–100 fit against the assessment profile. */
  matchPercentage: number;
  overview: string;
  whyItMatches: string;
  strengthsIdentified: string[];
  skillsToImprove: string[];
  salaryRange: SalaryRange;
  industryGrowth: IndustryGrowth;
  requiredEducation: string;
  recommendedCertifications: string[];
  futureOpportunities: string[];
}

/** `users/{uid}/recommendations/{id}` — one generated set (Top 5). */
export interface RecommendationSetDoc {
  id: string;
  /** The assessment this set was generated from (for staleness checks). */
  assessmentId: string;
  provider: string;
  model: string;
  schemaVersion: number;
  recommendations: CareerRecommendation[];
  createdAt: FirestoreTimestamp | null;
}
