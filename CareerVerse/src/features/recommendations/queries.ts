import { verifySession } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { isAIConfigured } from "@/lib/ai";
import type { CareerRecommendation, RecommendationSource } from "@/types/recommendation";

export interface RecommendationsPageData {
  hasCompletedAssessment: boolean;
  recommendations: CareerRecommendation[] | null;
  /** How the current set was produced ("fallback" shows an offline badge). */
  source: RecommendationSource | null;
  /** True when a set exists but a newer assessment has since been completed. */
  isStale: boolean;
  aiConfigured: boolean;
}

const EMPTY: RecommendationsPageData = {
  hasCompletedAssessment: false,
  recommendations: null,
  source: null,
  isStale: false,
  aiConfigured: false,
};

/** Server-side read for the recommendations page (all values serializable). */
export async function getRecommendationsPageData(): Promise<RecommendationsPageData> {
  const decoded = await verifySession();
  if (!decoded) return EMPTY;

  const [assessment, set] = await Promise.all([
    getLatestAssessment(decoded.uid),
    getLatestRecommendationSet(decoded.uid),
  ]);

  const hasCompletedAssessment = Boolean(assessment && assessment.status === "completed");
  const recommendations = set?.recommendations ?? null;
  const isStale = Boolean(
    recommendations &&
      hasCompletedAssessment &&
      set?.assessmentId &&
      assessment?.id &&
      set.assessmentId !== assessment.id,
  );

  return {
    hasCompletedAssessment,
    recommendations,
    source: set?.source ?? null,
    isStale,
    aiConfigured: isAIConfigured(),
  };
}
