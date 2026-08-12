import type { AchievementView, AnalyticsSnapshot } from "./types";

/*
 * Achievement catalog. Each badge is defined once with an XP reward and an
 * unlock predicate over the analytics snapshot. Adding a badge here makes it
 * appear everywhere (grid, XP total, recent-achievement widget) automatically.
 */
interface AchievementDef {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: string;
  accentVar: string;
  check: (s: AnalyticsSnapshot) => boolean;
}

export const ACHIEVEMENT_DEFS: AchievementDef[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Complete your career assessment.",
    xp: 100,
    icon: "compass",
    accentVar: "--accent-assessment",
    check: (s) => s.onboardingComplete,
  },
  {
    id: "first-match",
    title: "First Career Match",
    description: "Generate your AI career recommendations.",
    xp: 100,
    icon: "target",
    accentVar: "--accent-mentor",
    check: (s) => s.recommendationsCount > 0,
  },
  {
    id: "resume-completed",
    title: "Resume Completed",
    description: "Build a resume that's 80%+ complete.",
    xp: 150,
    icon: "file",
    accentVar: "--accent-resume",
    check: (s) => s.hasResume && s.resumeCompletion >= 80,
  },
  {
    id: "first-interview",
    title: "First Mock Interview",
    description: "Complete your first AI mock interview.",
    xp: 120,
    icon: "mic",
    accentVar: "--accent-interview",
    check: (s) => s.interviewsCount >= 1,
  },
  {
    id: "interview-ace",
    title: "Interview Ace",
    description: "Score 80+ in a mock interview.",
    xp: 200,
    icon: "trophy",
    accentVar: "--accent-interview",
    check: (s) => (s.interviewBest ?? 0) >= 80,
  },
  {
    id: "skill-master",
    title: "Skill Master",
    description: "Reach 80%+ skill readiness.",
    xp: 200,
    icon: "puzzle",
    accentVar: "--accent-assessment",
    check: (s) => (s.skillReadiness ?? 0) >= 80,
  },
  {
    id: "dream-ready",
    title: "Target Company Ready",
    description: "Hit 75%+ readiness for a target company.",
    xp: 250,
    icon: "rocket",
    accentVar: "--accent-mentor",
    check: (s) => (s.dreamReadiness ?? 0) >= 75,
  },
  {
    id: "learning-streak",
    title: "Learning Streak",
    description: "Stay active 3 days in a row.",
    xp: 120,
    icon: "flame",
    accentVar: "--accent-interview",
    check: (s) => Math.max(s.streak, s.longestStreak) >= 3,
  },
  {
    id: "roadmap-explorer",
    title: "Roadmap Explorer",
    description: "Generate a learning roadmap.",
    xp: 100,
    icon: "route",
    accentVar: "--accent-roadmap",
    check: (s) => s.roadmapExists,
  },
  {
    id: "roadmap-champion",
    title: "Roadmap Champion",
    description: "Complete 50%+ of your roadmap.",
    xp: 200,
    icon: "award",
    accentVar: "--accent-roadmap",
    check: (s) => s.roadmapPercent >= 50,
  },
  {
    id: "coach-power-user",
    title: "AI Coach Power User",
    description: "Have 3+ conversations with your AI Coach.",
    xp: 150,
    icon: "sparkles",
    accentVar: "--accent-mentor",
    check: (s) => s.coachConversations >= 3,
  },
];

export function evaluateAchievements(s: AnalyticsSnapshot): AchievementView[] {
  return ACHIEVEMENT_DEFS.map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description,
    xp: d.xp,
    icon: d.icon,
    accentVar: d.accentVar,
    unlocked: d.check(s),
  }));
}
