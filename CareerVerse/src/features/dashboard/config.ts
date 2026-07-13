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
} from "@/components/ui/icon";
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

export const FEATURE_SECTIONS: FeatureSection[] = [
  {
    key: "assessment",
    title: "Career Assessment",
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
