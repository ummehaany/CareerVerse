import { verifySession } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore/users";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { getPrimaryResume } from "@/lib/firebase/firestore/resumes";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { getInterviewAnalytics } from "@/lib/firebase/firestore/interviews";
import { listSkillAssessments } from "@/lib/firebase/firestore/skillAssessments";
import { getGamification } from "@/lib/firebase/firestore/gamification";
import { listConversations } from "@/lib/firebase/firestore/coachConversations";
import { getDreamState } from "@/lib/firebase/firestore/dreamCompanies";
import { getCompanyRecord } from "@/lib/companies/catalog";
import { buildCompanyProfile } from "@/lib/companies/profile";
import { buildUserSnapshot } from "@/features/companies/snapshot";
import { computeReadiness, pickDefaultRole } from "@/features/companies/analysis";
import type { ResumeDoc } from "@/types/resume";
import type { RoadmapDoc } from "@/types/roadmap";
import type {
  AnalyticsData,
  AnalyticsSnapshot,
  AnalyticsWidgetData,
  Point,
} from "./types";
import {
  buildCharts,
  buildWeeklyReport,
  careerReadinessOf,
  computeLevel,
  computeXp,
  evaluateAchievements,
  pickMotivation,
  weeklyGoalFor,
} from "./engine";

function resumeCompletion(resume: ResumeDoc | null): number {
  if (!resume) return 0;
  const c = resume.contact;
  const checks = [
    Boolean(c?.fullName?.trim()),
    Boolean(c?.headline?.trim()),
    Boolean(c?.email?.trim()),
    Boolean(resume.summary?.trim()),
    (resume.experience?.length ?? 0) > 0,
    (resume.education?.length ?? 0) > 0,
    (resume.skills?.length ?? 0) > 0,
    (resume.projects?.length ?? 0) > 0,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function roadmapStats(roadmap: RoadmapDoc | null): { percent: number; done: number } {
  if (!roadmap) return { percent: 0, done: 0 };
  const total = roadmap.stages.reduce((sum, s) => sum + s.milestones.length, 0);
  const done = Object.values(roadmap.progress ?? {}).filter((s) => s === "completed").length;
  return { percent: total ? Math.round((done / total) * 100) : 0, done };
}

function lastMonthLabels(count: number): string[] {
  const names = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();
  const out: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push(names[d.getMonth()]);
  }
  return out;
}

async function buildSnapshot(uid: string): Promise<AnalyticsSnapshot> {
  const [user, recs, resume, roadmapDoc, interviews, skillDocs, gamification, conversations, dreamState, userSnap] =
    await Promise.all([
      getUser(uid),
      getLatestRecommendationSet(uid),
      getPrimaryResume(uid),
      getLatestRoadmap(uid),
      getInterviewAnalytics(uid),
      listSkillAssessments(uid, 10),
      getGamification(uid),
      listConversations(uid, 40),
      getDreamState(uid),
      buildUserSnapshot(uid),
    ]);

  const rStats = roadmapStats(roadmapDoc);

  // Oldest → newest skill readiness history.
  const skillHistory: Point[] = skillDocs
    .slice()
    .reverse()
    .map((d, i) => ({ label: `A${i + 1}`, value: Math.round(d.readinessScore) }));

  // Target-company readiness (reuses the Target Companies engine).
  let dreamReadiness: number | null = null;
  const dreamRecord = dreamState.dream[0] ? getCompanyRecord(dreamState.dream[0]) : null;
  if (dreamRecord) {
    const profile = buildCompanyProfile(dreamRecord);
    const role = pickDefaultRole(profile, userSnap);
    dreamReadiness = computeReadiness(userSnap, profile, role).score;
  }

  return {
    onboardingComplete: user?.onboardingComplete ?? false,
    recommendationsCount: recs?.recommendations?.length ?? 0,
    hasResume: Boolean(resume),
    resumeCompletion: resumeCompletion(resume),
    roadmapExists: Boolean(roadmapDoc),
    roadmapPercent: rStats.percent,
    roadmapMilestonesDone: rStats.done,
    interviewsCount: interviews.count,
    interviewBest: interviews.bestScore,
    interviewAvg: interviews.averageScore,
    interviewTrend: interviews.trend,
    skillAssessmentsCount: skillDocs.length,
    skillReadiness: skillDocs[0]?.readinessScore ?? null,
    skillsMastered: skillDocs[0]?.masteredCount ?? 0,
    skillHistory,
    dreamReadiness,
    streak: gamification.streak,
    longestStreak: gamification.longestStreak,
    coachConversations: conversations.length,
  };
}

function emptySnapshot(): AnalyticsSnapshot {
  return {
    onboardingComplete: false,
    recommendationsCount: 0,
    hasResume: false,
    resumeCompletion: 0,
    roadmapExists: false,
    roadmapPercent: 0,
    roadmapMilestonesDone: 0,
    interviewsCount: 0,
    interviewBest: null,
    interviewAvg: null,
    interviewTrend: [],
    skillAssessmentsCount: 0,
    skillReadiness: null,
    skillsMastered: 0,
    skillHistory: [],
    dreamReadiness: null,
    streak: 0,
    longestStreak: 0,
    coachConversations: 0,
  };
}

function assemble(snapshot: AnalyticsSnapshot): AnalyticsData {
  const achievements = evaluateAchievements(snapshot);
  const { sources, total } = computeXp(snapshot, achievements);
  const level = computeLevel(total);
  const careerReadiness = careerReadinessOf(snapshot);
  const charts = buildCharts(snapshot, lastMonthLabels(6));
  const unlocked = achievements.filter((a) => a.unlocked);
  const seed = Math.floor(Date.now() / 86_400_000);

  return {
    level,
    xpSources: sources,
    achievements,
    achievementsUnlocked: unlocked.length,
    achievementsTotal: achievements.length,
    recentAchievement: unlocked.length ? unlocked[unlocked.length - 1] : null,
    charts,
    weeklyReport: buildWeeklyReport(snapshot, achievements, careerReadiness),
    streak: snapshot.streak,
    longestStreak: snapshot.longestStreak,
    careerReadiness,
    dailyMotivation: pickMotivation(seed),
    weeklyGoal: weeklyGoalFor(snapshot),
  };
}

/** uid-based snapshot for server-side use (email triggers, cron) — no session needed. */
export async function getUserAnalyticsSnapshot(uid: string): Promise<AnalyticsSnapshot> {
  return buildSnapshot(uid);
}

export async function getAnalyticsData(): Promise<AnalyticsData> {
  const decoded = await verifySession();
  if (!decoded) return assemble(emptySnapshot());
  return assemble(await buildSnapshot(decoded.uid));
}

export async function getAnalyticsWidgetData(): Promise<AnalyticsWidgetData> {
  const decoded = await verifySession();
  const snapshot = decoded ? await buildSnapshot(decoded.uid) : emptySnapshot();
  const achievements = evaluateAchievements(snapshot);
  const { total } = computeXp(snapshot, achievements);
  const level = computeLevel(total);
  const careerReadiness = careerReadinessOf(snapshot);
  const charts = buildCharts(snapshot, lastMonthLabels(6));
  const unlocked = achievements.filter((a) => a.unlocked);
  const seed = Math.floor(Date.now() / 86_400_000);

  return {
    level: level.level,
    levelTitle: level.title,
    xpIntoLevel: level.xpIntoLevel,
    xpForLevel: level.xpForLevel,
    streak: snapshot.streak,
    careerReadiness,
    readinessTrend: charts.readinessTrend,
    recentAchievement: unlocked.length ? unlocked[unlocked.length - 1].title : null,
    weeklyGoal: weeklyGoalFor(snapshot),
    dailyMotivation: pickMotivation(seed),
  };
}
