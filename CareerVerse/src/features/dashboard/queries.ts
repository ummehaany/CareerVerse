import { verifySession } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore/users";
import { getCareerProfile } from "@/lib/firebase/firestore/careerProfiles";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { getInterviewStats } from "@/lib/firebase/firestore/interviews";
import { getPrimaryResume } from "@/lib/firebase/firestore/resumes";
import { getBookmarkedIds } from "@/lib/firebase/firestore/bookmarks";
import { getDreamState } from "@/lib/firebase/firestore/dreamCompanies";
import { buildChecklist, type ChecklistItem } from "@/features/onboarding/checklist";
import type { SessionUser } from "@/types/session";
import type { FirestoreTimestamp } from "@/types/user";
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
  /** First-milestones checklist (Step 8); null unless the user has onboarded. */
  onboardingChecklist: ChecklistItem[] | null;
  /** True only for the account's first-ever session (see isFirstSession below). */
  isFirstSession: boolean;
}

function roadmapPercent(progress: Record<string, string> | undefined, total: number): number {
  if (!progress || total === 0) return 0;
  const done = Object.values(progress).filter((s) => s === "completed").length;
  return Math.round((done / total) * 100);
}

/**
 * Distinguishes a genuinely first-time visit from a returning one, reusing
 * fields the account already has — no new persistence was added.
 *
 * `ensureUser` (session bootstrap) writes `createdAt` and `lastActiveAt` with
 * the same `serverTimestamp()` call the moment an account is first created,
 * so they land on the identical commit time. `lastActiveAt` is the only one
 * of the two ever touched again, and only on a later session's login — so as
 * long as the two stay within a few minutes of each other, no session besides
 * the current one has happened yet. Once the student logs in again on a later
 * visit, `lastActiveAt` moves permanently ahead of `createdAt`, so this can
 * never "reset" a returning student back into the first-time state.
 */
function isFirstSession(user: { createdAt: FirestoreTimestamp; lastActiveAt: FirestoreTimestamp } | null): boolean {
  if (!user) return false;
  try {
    const created = user.createdAt.toDate().getTime();
    const lastActive = user.lastActiveAt.toDate().getTime();
    return Math.abs(lastActive - created) < 5 * 60 * 1000;
  } catch {
    return false;
  }
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
      onboardingChecklist: null,
      isFirstSession: false,
    };
  }
  const uid = decoded.uid;

  const [user, profile, roadmapDoc, recommendationSet, interviews, resume, bookmarks, dreamState] =
    await Promise.all([
      getUser(uid),
      getCareerProfile(uid),
      getLatestRoadmap(uid),
      getLatestRecommendationSet(uid),
      getInterviewStats(uid),
      getPrimaryResume(uid),
      getBookmarkedIds(uid),
      getDreamState(uid),
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

  // Step 8 checklist — only surfaced for users who completed the new onboarding.
  const companiesExplored =
    dreamState.saved.length + dreamState.dream.length + dreamState.recent.length > 0;
  const onboardingChecklist = user?.onboarding?.completed
    ? buildChecklist({
        assessmentDone: user?.onboardingComplete ?? false,
        resumeExists: Boolean(resume),
        companiesExplored,
        interviewsStarted: interviews.count > 0,
        roadmapViewed: roadmapDoc !== null,
      })
    : null;

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
    onboardingChecklist,
    isFirstSession: isFirstSession(user),
  };
}
