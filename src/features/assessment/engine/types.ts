/*
 * Career Assessment — engine types.
 *
 * The assessment is evaluated across 15 weighted dimensions. Every engine
 * (scoring → career mapping → recommendation → results) speaks these types, so
 * each stage is independently testable and a future AI layer can consume the
 * same `AssessmentResults` shape. Nothing here touches Firestore or React.
 */

export type DimensionId =
  | "interests"
  | "personality"
  | "workPreferences"
  | "technicalInclination"
  | "creativity"
  | "leadership"
  | "communication"
  | "problemSolving"
  | "analyticalThinking"
  | "learningStyle"
  | "riskTolerance"
  | "collaboration"
  | "independence"
  | "careerValues"
  | "motivation";

export type DimensionScores = Record<DimensionId, number>;

export type ConfidenceLevel = "High" | "Medium" | "Low";

export interface DimensionInsight {
  id: DimensionId;
  label: string;
  score: number; // 0–100
  description: string;
}

export interface CareerMatch {
  slug: string;
  title: string;
  category: string;
  /** 0–100 overall compatibility. */
  compatibility: number;
  confidence: ConfidenceLevel;
  /** Human-readable reasons this career fits (explainability). */
  reasons: string[];
  /** Dimension labels that drove the match most. */
  drivingDimensions: string[];
  matchedInterests: string[];
  skillsToDevelop: string[];
  salaryLabel: string;
}

export interface DreamCompanyMatch {
  name: string;
  slug: string;
  reason: string;
}

export interface AssessmentResults {
  summary: string;
  readinessScore: number;
  confidenceLevel: ConfidenceLevel;
  dimensions: DimensionInsight[];
  topStrengths: DimensionInsight[];
  growthAreas: DimensionInsight[];
  personality: {
    socialEnergy: string | null;
    decisionStyle: string | null;
    structure: string | null;
  };
  workEnvironment: string;
  leadershipStyle: string;
  learningStyle: string;
  values: string[];
  primaryMatch: CareerMatch | null;
  topMatches: CareerMatch[];
  alternatives: CareerMatch[];
  dreamCompanies: DreamCompanyMatch[];
  skillsToLearn: string[];
  certifications: string[];
}
