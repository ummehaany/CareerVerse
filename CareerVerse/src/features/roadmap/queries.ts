import { verifySession } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { isAIConfigured } from "@/lib/ai";
import type { CareerOption, RoadmapView } from "./types";

export interface RoadmapPageData {
  hasCompletedAssessment: boolean;
  /** Careers the user can target (from their recommendations). */
  careerOptions: CareerOption[];
  roadmap: RoadmapView | null;
  aiConfigured: boolean;
}

const EMPTY: RoadmapPageData = {
  hasCompletedAssessment: false,
  careerOptions: [],
  roadmap: null,
  aiConfigured: false,
};

/** Server-side read for the roadmap page (all values serializable). */
export async function getRoadmapPageData(): Promise<RoadmapPageData> {
  const decoded = await verifySession();
  if (!decoded) return EMPTY;
  const uid = decoded.uid;

  const [assessment, recommendationSet, roadmapDoc] = await Promise.all([
    getLatestAssessment(uid),
    getLatestRecommendationSet(uid),
    getLatestRoadmap(uid),
  ]);

  const careerOptions: CareerOption[] = (recommendationSet?.recommendations ?? []).map((rec) => ({
    title: rec.title,
    matchPercentage: rec.matchPercentage,
  }));

  const roadmap: RoadmapView | null = roadmapDoc
    ? {
        id: roadmapDoc.id,
        careerTitle: roadmapDoc.careerTitle,
        overview: roadmapDoc.overview,
        totalEstimatedTime: roadmapDoc.totalEstimatedTime,
        stages: roadmapDoc.stages,
        progress: roadmapDoc.progress ?? {},
      }
    : null;

  return {
    hasCompletedAssessment: Boolean(assessment && assessment.status === "completed"),
    careerOptions,
    roadmap,
    aiConfigured: isAIConfigured(),
  };
}
