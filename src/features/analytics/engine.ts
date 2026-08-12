import { evaluateAchievements } from "./achievements";
import type {
  AchievementView,
  AnalyticsCharts,
  AnalyticsSnapshot,
  LevelInfo,
  Point,
  WeeklyReport,
  XpSource,
} from "./types";

/*
 * Deterministic analytics engine (placeholder for a future data pipeline).
 * Turns the current-state snapshot into XP/level, chart series, a weekly report
 * and motivation. Where the app doesn't yet store history, series are
 * synthesized to rise toward the real current value — clearly placeholder data,
 * but shaped exactly like what a backend would later provide.
 */

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function clampInt(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function ease(t: number): number {
  return t * t * (3 - 2 * t);
}

/** A gently-rising series ending at `current` (deterministic). */
function synthTrend(current: number, labels: string[], floorRatio = 0.5): Point[] {
  const n = labels.length;
  return labels.map((label, i) => {
    if (current <= 0) return { label, value: 0 };
    const t = n <= 1 ? 1 : i / (n - 1);
    return { label, value: clampInt(current * (floorRatio + (1 - floorRatio) * ease(t))) };
  });
}

export function careerReadinessOf(s: AnalyticsSnapshot): number {
  const parts = [s.skillReadiness, s.resumeCompletion, s.roadmapPercent, s.interviewBest, s.dreamReadiness].filter(
    (n): n is number => typeof n === "number" && n > 0,
  );
  if (!parts.length) return 0;
  return Math.round(parts.reduce((a, b) => a + b, 0) / parts.length);
}

/* ── XP & level ────────────────────────────────────────────────────────────*/

export function computeXp(s: AnalyticsSnapshot, achievements: AchievementView[]): {
  sources: XpSource[];
  total: number;
} {
  const achievementXp = achievements.filter((a) => a.unlocked).reduce((sum, a) => sum + a.xp, 0);
  const sources: XpSource[] = [
    { label: "Achievements unlocked", xp: achievementXp },
    { label: "Roadmap milestones", xp: s.roadmapMilestonesDone * 20 },
    { label: "Mock interviews", xp: s.interviewsCount * 30 },
    { label: "Skill assessments", xp: s.skillAssessmentsCount * 25 },
  ];
  const total = sources.reduce((sum, x) => sum + x.xp, 0);
  return { sources, total };
}

const LEVEL_TITLES = ["Explorer", "Rising Star", "Achiever", "Strategist", "Trailblazer", "Career Master"];

function titleForLevel(level: number): string {
  const idx = Math.min(LEVEL_TITLES.length - 1, Math.floor((level - 1) / 2));
  return LEVEL_TITLES[idx];
}

export function computeLevel(totalXp: number): LevelInfo {
  let level = 1;
  let remaining = Math.max(0, totalXp);
  let cost = 200;
  while (remaining >= cost) {
    remaining -= cost;
    level += 1;
    cost = 200 + (level - 1) * 100;
  }
  return {
    level,
    title: titleForLevel(level),
    totalXp,
    xpIntoLevel: remaining,
    xpForLevel: cost,
    xpToNext: cost - remaining,
    nextMilestone: `Level ${level + 1} · ${titleForLevel(level + 1)}`,
  };
}

/* ── Charts ────────────────────────────────────────────────────────────────*/

export function buildCharts(s: AnalyticsSnapshot, monthLabels: string[]): AnalyticsCharts {
  const readiness = careerReadinessOf(s);

  const interviewScores: Point[] =
    s.interviewTrend.length > 0
      ? s.interviewTrend.map((v, i) => ({ label: `#${i + 1}`, value: clampInt(v) }))
      : synthTrend(s.interviewBest ?? 0, ["#1", "#2", "#3", "#4", "#5"]);

  const skillGrowth: Point[] =
    s.skillHistory.length > 0
      ? s.skillHistory.map((p) => ({ label: p.label, value: clampInt(p.value) }))
      : synthTrend(s.skillReadiness ?? 0, ["W1", "W2", "W3", "W4", "W5", "W6"]);

  // Learning streak — activity intensity per day this week (deterministic).
  const activeDays = Math.min(7, Math.max(0, s.streak));
  const learningStreak: Point[] = DAY_LABELS.map((label, i) => ({
    label,
    value: i < activeDays ? 100 : i === activeDays && s.streak > 0 ? 60 : 0,
  }));

  const baseHours = s.roadmapExists || s.interviewsCount > 0 ? 4 : 1;
  const weeklyLearningHours: Point[] = DAY_LABELS.map((label, i) => ({
    label,
    value: i < activeDays ? Math.round((baseHours * (0.6 + ease(i / 6) * 0.8)) * 10) / 10 : 0,
  }));

  const weeklyActivity: Point[] = DAY_LABELS.map((label, i) => ({
    label,
    value: i < activeDays ? clampInt(50 + ease(i / 6) * 50) : i === activeDays ? 25 : 0,
  }));

  return {
    readinessTrend: synthTrend(readiness, monthLabels),
    skillsAcquired: synthTrend(s.skillsMastered, ["W1", "W2", "W3", "W4", "W5", "W6"], 0.2),
    interviewScores,
    resumeHistory: synthTrend(s.resumeCompletion, ["v1", "v2", "v3", "v4", "v5"], 0.4),
    learningStreak,
    weeklyLearningHours,
    weeklyActivity,
    monthlyProgress: synthTrend(readiness, monthLabels, 0.45),
    roadmapCompletion: s.roadmapPercent,
    skillGrowth,
  };
}

/* ── Weekly report ─────────────────────────────────────────────────────────*/

export function buildWeeklyReport(
  s: AnalyticsSnapshot,
  achievements: AchievementView[],
  careerReadiness: number,
): WeeklyReport {
  const unlocked = achievements.filter((a) => a.unlocked);
  const band = careerReadiness >= 70 ? "strong momentum" : careerReadiness >= 40 ? "steady progress" : "an early but promising start";

  return {
    summary: `You're at ${careerReadiness}% career readiness with ${band}. You've unlocked ${unlocked.length} of ${achievements.length} achievements and kept a ${s.streak}-day streak.`,
    newAchievements: unlocked.slice(-3).map((a) => a.title),
    skillsLearned: s.skillsMastered > 0 ? [`${s.skillsMastered} skills mastered so far`] : ["Add skills via Career Discovery to start tracking"],
    recommendations: [
      s.resumeCompletion < 80 ? "Push your resume past 80% completeness" : "Tailor your resume to a target company",
      s.interviewsCount === 0 ? "Run your first mock interview" : "Beat your best interview score",
      s.roadmapExists ? "Complete your next roadmap milestone" : "Generate a learning roadmap",
    ],
    nextGoals: [
      "Keep your learning streak alive",
      s.dreamReadiness !== null ? "Close one gap for your target company" : "Pick a target company to aim for",
      "Earn one new achievement",
    ],
  };
}

/* ── Motivation & goals ────────────────────────────────────────────────────*/

const MOTIVATIONS = [
  "Small, consistent steps compound into a career.",
  "Every skill you add widens the doors open to you.",
  "Progress beats perfection — keep moving.",
  "Your future self is built by today's practice.",
  "Consistency is the ultimate career superpower.",
  "One milestone at a time is how big goals fall.",
  "Show up today; momentum does the rest.",
];

export function pickMotivation(seed: number): string {
  const i = ((seed % MOTIVATIONS.length) + MOTIVATIONS.length) % MOTIVATIONS.length;
  return MOTIVATIONS[i];
}

export function weeklyGoalFor(s: AnalyticsSnapshot): string {
  if (!s.onboardingComplete) return "Complete your career assessment";
  if (s.interviewsCount === 0) return "Run your first mock interview";
  if (s.resumeCompletion < 80) return "Get your resume to 80%+";
  if (s.roadmapExists && s.roadmapPercent < 100) return "Complete your next roadmap milestone";
  return "Earn a new achievement this week";
}

export { evaluateAchievements };
