import { verifySession } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { getBookmarkedIds } from "@/lib/firebase/firestore/bookmarks";
import { LEARNING_CATALOG, LEARNING_CATEGORIES, CATALOG_BY_ID } from "./catalog";
import type { LearningResourceView } from "./types";

export interface LearningPageData {
  resources: LearningResourceView[];
  categories: string[];
  recommendedIds: string[];
  bookmarkedCount: number;
}

function baseData(): LearningPageData {
  return {
    resources: LEARNING_CATALOG.map((r) => ({ ...r, bookmarked: false, recommended: false })),
    categories: LEARNING_CATEGORIES,
    recommendedIds: [],
    bookmarkedCount: 0,
  };
}

/** Learning Hub data, personalized from the user's profile + active roadmap. */
export async function getLearningPageData(): Promise<LearningPageData> {
  const decoded = await verifySession();
  if (!decoded) return baseData();
  const uid = decoded.uid;

  const [assessment, roadmap, bookmarkedIds] = await Promise.all([
    getLatestAssessment(uid),
    getLatestRoadmap(uid),
    getBookmarkedIds(uid),
  ]);

  const bookmarkSet = new Set(bookmarkedIds);

  // Collect skill/interest keywords the user cares about.
  const keywords = new Set<string>();
  const add = (values?: string[]) => values?.forEach((v) => keywords.add(v.toLowerCase()));
  if (assessment?.structured) {
    add(assessment.structured.technicalSkills);
    add(assessment.structured.interests);
  }
  roadmap?.stages.forEach((stage) => stage.milestones.forEach((m) => add(m.skills)));

  const scored = LEARNING_CATALOG.map((resource) => ({
    resource,
    score: resource.skills.reduce(
      (acc, skill) => acc + (keywords.has(skill.toLowerCase()) ? 1 : 0),
      0,
    ),
  }));

  const recommendedIds = scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6)
    .map((s) => s.resource.id);
  const recommendedSet = new Set(recommendedIds);

  const resources: LearningResourceView[] = LEARNING_CATALOG.map((resource) => ({
    ...resource,
    bookmarked: bookmarkSet.has(resource.id),
    recommended: recommendedSet.has(resource.id),
  }));

  return {
    resources,
    categories: LEARNING_CATEGORIES,
    recommendedIds,
    bookmarkedCount: bookmarkedIds.filter((id) => CATALOG_BY_ID[id]).length,
  };
}
