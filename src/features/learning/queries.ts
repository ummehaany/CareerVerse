import { verifySession } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { getBookmarkedIds } from "@/lib/firebase/firestore/bookmarks";
import { getAllResources } from "./service";
import { rankResources, buildFacets } from "./service/query";
import type {
  LearningResourceView,
  LearningFacets,
  RecommendationContext,
} from "./types";

export interface LearningPageData {
  resources: LearningResourceView[];
  facets: LearningFacets;
  recommendedIds: string[];
  bookmarkedCount: number;
}

const EMPTY_CONTEXT: RecommendationContext = {
  skills: [],
  interests: [],
  careerGoal: "",
  targetCareer: "",
  targetCompanies: [],
  missingSkills: [],
  roadmapSkills: [],
  completedIds: [],
};

/**
 * Learning Hub data, personalized from the user's Career Discovery profile and
 * active roadmap. Resources come from the storage-agnostic service, are ranked
 * by personalized relevance, then enriched (per-user bookmark state). Facets are
 * derived from the full dataset so the filter controls always reflect what
 * exists — this is what lets the hub behave like a real platform at scale.
 */
export async function getLearningPageData(): Promise<LearningPageData> {
  const resources = await getAllResources();
  const facets = buildFacets(resources);

  const decoded = await verifySession();
  if (!decoded) {
    const ranked = rankResources(resources, EMPTY_CONTEXT);
    return {
      resources: ranked.map((r) => ({ ...r, bookmarked: false })),
      facets,
      recommendedIds: [],
      bookmarkedCount: 0,
    };
  }

  const uid = decoded.uid;
  const [assessment, roadmap, bookmarkedIds] = await Promise.all([
    getLatestAssessment(uid),
    getLatestRoadmap(uid),
    getBookmarkedIds(uid),
  ]);
  const bookmarkSet = new Set(bookmarkedIds);

  const structured = assessment?.structured ?? null;

  // Roadmap skills split into "still to learn" vs. "already completed".
  const roadmapSkills = new Set<string>();
  const completedSkills = new Set<string>();
  roadmap?.stages.forEach((stage) =>
    stage.milestones.forEach((m) => {
      const done = roadmap.progress?.[m.id] === "completed";
      m.skills.forEach((s) => {
        roadmapSkills.add(s);
        if (done) completedSkills.add(s.toLowerCase());
      });
    }),
  );

  const userSkills = structured?.technicalSkills ?? [];
  const userSkillSet = new Set(userSkills.map((s) => s.toLowerCase()));

  // Missing skills = roadmap targets the user neither has nor has completed.
  const missingSkills = Array.from(roadmapSkills).filter((s) => {
    const n = s.toLowerCase();
    return !userSkillSet.has(n) && !completedSkills.has(n);
  });

  const ctx: RecommendationContext = {
    skills: userSkills,
    interests: [...(structured?.interests ?? []), ...(structured?.workActivities ?? [])],
    careerGoal: structured?.goals.aspiration ?? structured?.industryDirection ?? "",
    targetCareer: roadmap?.careerTitle ?? structured?.goals.targetRoles?.[0] ?? "",
    targetCompanies: [],
    missingSkills,
    roadmapSkills: Array.from(roadmapSkills),
    completedIds: [],
  };

  const ranked = rankResources(resources, ctx);
  const resourceViews: LearningResourceView[] = ranked.map((r) => ({
    ...r,
    bookmarked: bookmarkSet.has(r.id),
  }));

  const recommendedIds = ranked
    .filter((r) => r.relevanceScore > 0)
    .slice(0, 6)
    .map((r) => r.id);

  const catalogIds = new Set(resources.map((r) => r.id));
  return {
    resources: resourceViews,
    facets,
    recommendedIds,
    bookmarkedCount: bookmarkedIds.filter((id) => catalogIds.has(id)).length,
  };
}
