import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import {
  CompassIcon,
  GlobeIcon,
  TargetIcon,
  RouteIcon,
  BookIcon,
  FileTextIcon,
  MicIcon,
  SparklesIcon,
  RocketIcon,
  ClockIcon,
  PuzzleIcon,
} from "@/components/ui/icon";
import { AwardIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import type { CareerProfile } from "@/types/career-profile";

/*
 * Dashboard is composed from data-driven slots. Feature statuses and stat
 * values are computed from live data in the page; these describe the surfaces.
 */

export interface FeatureSection {
  key: string;
  title: string;
  description: string;
  href: string;
  cta: string;
  icon: ComponentType<IconProps>;
  accentVar: string;
}

/*
 * Progressive disclosure: before Career Discovery is complete, the dashboard
 * shows only the subset of features that are genuinely useful without a
 * career direction yet (assessment, resume, general exploration). The rest —
 * Career Matches, Roadmap, Mock Interviews — depend on a direction Career
 * Discovery hasn't produced yet, and reappear on the dashboard once it has.
 * Nothing here is disabled or removed: every feature stays reachable through
 * the normal sidebar navigation regardless of stage.
 */
export const EARLY_FEATURE_KEYS: readonly string[] = ["assessment", "learning", "resume"];
export const EARLY_QUICK_ACTION_KEYS: readonly string[] = ["assessment", "careers", "resume", "coach"];

export const FEATURE_SECTIONS: FeatureSection[] = [
  {
    key: "assessment",
    title: "Career Discovery",
    description: "Answer a short questionnaire to build your AI career profile.",
    href: ROUTES.assessment,
    cta: "Open assessment",
    icon: CompassIcon,
    accentVar: "--accent-assessment",
  },
  {
    key: "recommendations",
    title: "Career Matches",
    description: "See your Top 5 AI-matched careers with fit scores and salary ranges.",
    href: ROUTES.recommendations,
    cta: "View matches",
    icon: TargetIcon,
    accentVar: "--accent-mentor",
  },
  {
    key: "companies",
    title: "Target Companies",
    description: "Track your readiness against the companies you're targeting.",
    href: ROUTES.companies,
    cta: "View companies",
    icon: RocketIcon,
    accentVar: "--accent-mentor",
  },
  {
    key: "roadmap",
    title: "Learning Roadmap",
    description: "A personalized beginner → advanced path toward your target role.",
    href: ROUTES.roadmap,
    cta: "Open roadmap",
    icon: RouteIcon,
    accentVar: "--accent-roadmap",
  },
  {
    key: "learning",
    title: "Learning Hub",
    description: "A curated library of resources, personalized to your goals.",
    href: ROUTES.learning,
    cta: "Browse resources",
    icon: BookIcon,
    accentVar: "--accent-interview",
  },
  {
    key: "resume",
    title: "Resume Builder",
    description: "Build an ATS-friendly resume and export it to PDF.",
    href: ROUTES.resume,
    cta: "Edit resume",
    icon: FileTextIcon,
    accentVar: "--accent-resume",
  },
  {
    key: "interviews",
    title: "Mock Interviews",
    description: "Practice role-based interviews with AI scoring and feedback.",
    href: ROUTES.interviews,
    cta: "Start practicing",
    icon: MicIcon,
    accentVar: "--accent-assessment",
  },
  {
    key: "timeline",
    title: "Career Timeline",
    description: "See your career journey mapped as milestones over time.",
    href: ROUTES.timeline,
    cta: "View timeline",
    icon: ClockIcon,
    accentVar: "--accent-roadmap",
  },
  {
    key: "achievements",
    title: "Achievements",
    description: "Badges and milestones you've unlocked along the way.",
    href: ROUTES.achievements,
    cta: "View achievements",
    icon: AwardIcon,
    accentVar: "--accent-resume",
  },
  {
    key: "skillgap",
    title: "Skill Gap",
    description: "See where your skills fall short of your target role.",
    href: ROUTES.skillGap,
    cta: "View skill gap",
    icon: PuzzleIcon,
    accentVar: "--accent-interview",
  },
];

export interface QuickAction {
  key: string;
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
}

export const QUICK_ACTIONS: QuickAction[] = [
  { key: "assessment", label: "Assessment", href: ROUTES.assessment, icon: CompassIcon },
  { key: "careers", label: "Explore", href: ROUTES.careers, icon: GlobeIcon },
  { key: "recommendations", label: "Matches", href: ROUTES.recommendations, icon: TargetIcon },
  { key: "roadmap", label: "Roadmap", href: ROUTES.roadmap, icon: RouteIcon },
  { key: "learning", label: "Learning", href: ROUTES.learning, icon: BookIcon },
  { key: "resume", label: "Resume", href: ROUTES.resume, icon: FileTextIcon },
  { key: "interviews", label: "Interview", href: ROUTES.interviews, icon: MicIcon },
  { key: "coach", label: "AI Coach", href: ROUTES.coach, icon: SparklesIcon },
];

/** Early-stage subset of the "Explore CareerVerse" cards (see progressive-disclosure note above). */
export const EARLY_FEATURE_SECTIONS: FeatureSection[] = FEATURE_SECTIONS.filter((f) =>
  EARLY_FEATURE_KEYS.includes(f.key),
);

/** Early-stage subset of Quick Actions (see progressive-disclosure note above). */
export const EARLY_QUICK_ACTIONS: QuickAction[] = QUICK_ACTIONS.filter((a) =>
  EARLY_QUICK_ACTION_KEYS.includes(a.key),
);

export interface OverviewStat {
  key: string;
  label: string;
  value: string;
  hint: string;
  /** 0–100 to show a meter, or null for a bare figure. */
  progress: number | null;
  icon: ComponentType<IconProps>;
  accentVar: string;
}

/** Rough profile-completeness score (0–100) from the filled profile fields. */
export function computeProfileCompleteness(profile: CareerProfile | null): number {
  if (!profile) return 0;
  const checks = [
    profile.education.length > 0,
    profile.experience.length > 0,
    Boolean(profile.currentRole),
    profile.skills.length > 0,
    profile.interests.length > 0,
    profile.goals.length > 0,
    profile.targetRoles.length > 0,
    profile.strengths.length > 0,
    Boolean(profile.aiSummary),
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}
