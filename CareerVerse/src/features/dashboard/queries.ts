import { verifySession } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore/users";
import { getCareerProfile } from "@/lib/firebase/firestore/careerProfiles";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { getInterviewStats } from "@/lib/firebase/firestore/interviews";
import { getPrimaryResume } from "@/lib/firebase/firestore/resumes";
import { getBookmarkedIds } from "@/lib/firebase/firestore/bookmarks";
import type { SessionUser } from "@/types/session";
import { computeProfileCompleteness } from "./config";

export interface DashboardData {
  user: SessionUser | null;
  onboardingComplete: boolean;
  completeness: number;
  recommendationsCount: number;
  roadmap: { careerTitle: string; percent: number } | null;
  interviews: { count: number; bestScore: number | null };
  resumeExists: boolean;
  bookmarksCount: number;
}

function roadmapPercent(progress: Record<string, string> | undefined, total: number): number {
  if (!progress || total === 0) return 0;
  const done = Object.values(progress).filter((s) => s === "completed").length;
  return Math.round((done / total) * 100);
}

/** Aggregate everything the dashboard needs in one server-side read. */
export async function getDashboardData(): Promise<DashboardData> {
  const decoded = await verifySession();
  if (!decoded) {
    return {
      user: null,
      onboardingComplete: false,
      completeness: 0,
      recommendationsCount: 0,
      roadmap: null,
      interviews: { count: 0, bestScore: null },
      resumeExists: false,
      bookmarksCount: 0,
    };
  }
  const uid = decoded.uid;

  const [user, profile, roadmapDoc, recommendationSet, interviews, resume, bookmarks] =
    await Promise.all([
      getUser(uid),
      getCareerProfile(uid),
      getLatestRoadmap(uid),
      getLatestRecommendationSet(uid),
      getInterviewStats(uid),
      getPrimaryResume(uid),
      getBookmarkedIds(uid),
    ]);

  const sessionUser: SessionUser | null = user
    ? {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
        plan: user.plan,
      }
    : null;

  const totalMilestones = roadmapDoc
    ? roadmapDoc.stages.reduce((sum, stage) => sum + stage.milestones.length, 0)
    : 0;

  return {
    user: sessionUser,
    onboardingComplete: user?.onboardingComplete ?? false,
    completeness: computeProfileCompleteness(profile),
    recommendationsCount: recommendationSet?.recommendations.length ?? 0,
    roadmap: roadmapDoc
      ? { careerTitle: roadmapDoc.careerTitle, percent: roadmapPercent(roadmapDoc.progress, totalMilestones) }
      : null,
    interviews,
    resumeExists: Boolean(resume),
    bookmarksCount: bookmarks.length,
  };
}
