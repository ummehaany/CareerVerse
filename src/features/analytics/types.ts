/*
 * Career Analytics & Achievement Center — shared types. All serializable so the
 * server queries can hand a fully-computed payload to client components, and so
 * a future backend can populate the same shapes from stored time-series.
 */

export interface Point {
  label: string;
  value: number;
}

/** Raw metrics gathered from every module — the basis for XP, charts, badges. */
export interface AnalyticsSnapshot {
  onboardingComplete: boolean;
  recommendationsCount: number;
  hasResume: boolean;
  resumeCompletion: number;
  roadmapExists: boolean;
  roadmapPercent: number;
  roadmapMilestonesDone: number;
  interviewsCount: number;
  interviewBest: number | null;
  interviewAvg: number | null;
  interviewTrend: number[];
  skillAssessmentsCount: number;
  skillReadiness: number | null;
  skillsMastered: number;
  skillHistory: Point[];
  dreamReadiness: number | null;
  streak: number;
  longestStreak: number;
  coachConversations: number;
}

export interface LevelInfo {
  level: number;
  title: string;
  totalXp: number;
  xpIntoLevel: number;
  xpForLevel: number;
  xpToNext: number;
  nextMilestone: string;
}

export interface XpSource {
  label: string;
  xp: number;
}

export interface AchievementView {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
  accentVar: string;
  unlocked: boolean;
}

export interface AnalyticsCharts {
  readinessTrend: Point[];
  skillsAcquired: Point[];
  interviewScores: Point[];
  resumeHistory: Point[];
  learningStreak: Point[];
  weeklyLearningHours: Point[];
  weeklyActivity: Point[];
  monthlyProgress: Point[];
  roadmapCompletion: number;
  skillGrowth: Point[];
}

export interface WeeklyReport {
  summary: string;
  newAchievements: string[];
  skillsLearned: string[];
  recommendations: string[];
  nextGoals: string[];
}

export interface AnalyticsData {
  level: LevelInfo;
  xpSources: XpSource[];
  achievements: AchievementView[];
  achievementsUnlocked: number;
  achievementsTotal: number;
  recentAchievement: AchievementView | null;
  charts: AnalyticsCharts;
  weeklyReport: WeeklyReport;
  streak: number;
  longestStreak: number;
  careerReadiness: number;
  dailyMotivation: string;
  weeklyGoal: string;
}

export interface AnalyticsWidgetData {
  level: number;
  levelTitle: string;
  xpIntoLevel: number;
  xpForLevel: number;
  streak: number;
  careerReadiness: number;
  readinessTrend: Point[];
  recentAchievement: string | null;
  weeklyGoal: string;
  dailyMotivation: string;
}
