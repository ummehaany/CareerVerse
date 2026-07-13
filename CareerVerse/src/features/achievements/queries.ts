import { verifySession } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore/users";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { getInterviewStats } from "@/lib/firebase/firestore/interviews";
import { getPrimaryResume } from "@/lib/firebase/firestore/resumes";
import { getBookmarkedIds } from "@/lib/firebase/firestore/bookmarks";
import { getFavoriteSlugs } from "@/lib/firebase/firestore/careerFavorites";
import { getGamification } from "@/lib/firebase/firestore/gamification";
import type { AchievementSnapshot } from "./config";

export interface AchievementsData {
  snapshot: AchievementSnapshot;
  streak: number;
  longestStreak: number;
}

const EMPTY: AchievementsData = {
  snapshot: {
    onboardingComplete: false,
    recommendationsCount: 0,
    roadmapExists: false,
    roadmapCompleted: 0,
    interviewsCount: 0,
    bestScore: null,
    resumeExists: false,
    bookmarksCount: 0,
    favoritesCount: 0,
  },
  streak: 0,
  longestStreak: 0,
};

export async function getAchievementsData(): Promise<AchievementsData> {
  const decoded = await verifySession();
  if (!decoded) return EMPTY;
  const uid = decoded.uid;

  const [user, recommendationSet, roadmap, interviews, resume, bookmarks, favorites, gamification] =
    await Promise.all([
      getUser(uid),
      getLatestRecommendationSet(uid),
      getLatestRoadmap(uid),
      getInterviewStats(uid),
      getPrimaryResume(uid),
      getBookmarkedIds(uid),
      getFavoriteSlugs(uid),
      getGamification(uid),
    ]);

  const roadmapCompleted = roadmap
    ? Object.values(roadmap.progress ?? {}).filter((s) => s === "completed").length
    : 0;

  return {
    snapshot: {
      onboardingComplete: user?.onboardingComplete ?? false,
      recommendationsCount: recommendationSet?.recommendations.length ?? 0,
      roadmapExists: Boolean(roadmap),
      roadmapCompleted,
      interviewsCount: interviews.count,
      bestScore: interviews.bestScore,
      resumeExists: Boolean(resume),
      bookmarksCount: bookmarks.length,
      favoritesCount: favorites.length,
    },
    streak: gamification.streak,
    longestStreak: gamification.longestStreak,
  };
}
