import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import {
  CompassIcon,
  TargetIcon,
  RouteIcon,
  MicIcon,
  FileTextIcon,
  BookIcon,
  GlobeIcon,
  TrendingUpIcon,
  SparklesIcon,
  CheckCircleIcon,
} from "@/components/ui/icon";

export interface AchievementSnapshot {
  onboardingComplete: boolean;
  recommendationsCount: number;
  roadmapExists: boolean;
  roadmapCompleted: number;
  interviewsCount: number;
  bestScore: number | null;
  resumeExists: boolean;
  bookmarksCount: number;
  favoritesCount: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  xp: number;
  icon: ComponentType<IconProps>;
  check: (s: AchievementSnapshot) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    description: "Complete your career assessment.",
    xp: 100,
    icon: CompassIcon,
    check: (s) => s.onboardingComplete,
  },
  {
    id: "matched",
    title: "Matched",
    description: "Generate your AI career recommendations.",
    xp: 100,
    icon: TargetIcon,
    check: (s) => s.recommendationsCount > 0,
  },
  {
    id: "explorer",
    title: "Explorer",
    description: "Save your first career to favorites.",
    xp: 50,
    icon: GlobeIcon,
    check: (s) => s.favoritesCount >= 1,
  },
  {
    id: "planner",
    title: "Planner",
    description: "Create a learning roadmap.",
    xp: 100,
    icon: RouteIcon,
    check: (s) => s.roadmapExists,
  },
  {
    id: "in-motion",
    title: "In Motion",
    description: "Complete your first roadmap milestone.",
    xp: 75,
    icon: TrendingUpIcon,
    check: (s) => s.roadmapCompleted >= 1,
  },
  {
    id: "committed",
    title: "Committed",
    description: "Complete five roadmap milestones.",
    xp: 200,
    icon: CheckCircleIcon,
    check: (s) => s.roadmapCompleted >= 5,
  },
  {
    id: "interviewer",
    title: "Interviewer",
    description: "Complete a mock interview.",
    xp: 100,
    icon: MicIcon,
    check: (s) => s.interviewsCount >= 1,
  },
  {
    id: "ace",
    title: "Ace",
    description: "Score 80+ in a mock interview.",
    xp: 200,
    icon: SparklesIcon,
    check: (s) => (s.bestScore ?? 0) >= 80,
  },
  {
    id: "resume-ready",
    title: "Resume Ready",
    description: "Start building your resume.",
    xp: 75,
    icon: FileTextIcon,
    check: (s) => s.resumeExists,
  },
  {
    id: "bookworm",
    title: "Bookworm",
    description: "Save five learning resources.",
    xp: 100,
    icon: BookIcon,
    check: (s) => s.bookmarksCount >= 5,
  },
];

/** Cumulative XP needed to reach each level (index 0 = level 1). */
export const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1400, 1900];

export interface LevelInfo {
  level: number;
  intoLevel: number;
  span: number;
  nextAt: number | null;
}

export function levelForXp(xp: number): LevelInfo {
  let index = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i += 1) {
    if (xp >= LEVEL_THRESHOLDS[i]!) index = i;
  }
  const base = LEVEL_THRESHOLDS[index]!;
  const next = LEVEL_THRESHOLDS[index + 1] ?? null;
  return {
    level: index + 1,
    intoLevel: xp - base,
    span: next !== null ? next - base : 1,
    nextAt: next,
  };
}
