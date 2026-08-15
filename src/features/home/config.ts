import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import {
  CompassIcon,
  TargetIcon,
  RouteIcon,
  MicIcon,
  PuzzleIcon,
  ChartIcon,
  GlobeIcon,
  LightbulbIcon,
  TrendingUpIcon,
} from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";

/*
 * Static content for the public homepage ("/"). Kept data-driven, mirroring the
 * pattern used by dashboard/config.ts and about/config.ts — the page itself
 * stays a thin composition layer. Every feature referenced here is a real,
 * shipped route (see config/nav.ts / dashboard/config.ts) — nothing here
 * advertises functionality that doesn't exist yet.
 */

export interface HomeNavLink {
  label: string;
  href: string;
}

/** Anchor links shown in the logged-out header + footer. */
export const NAV_LINKS: HomeNavLink[] = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Explore Careers", href: ROUTES.careers },
];

export interface HomeFeature {
  key: string;
  title: string;
  description: string;
  cta: string;
  href: string;
  icon: ComponentType<IconProps>;
  accentVar: string;
}

/** Section 5 — feature cards. Href + copy map 1:1 to real, implemented routes. */
export const FEATURES: HomeFeature[] = [
  {
    key: "assessment",
    title: "Career Discovery",
    description:
      "A short, adaptive assessment that turns your interests, strengths, and work style into a real career profile.",
    cta: "Start the assessment",
    href: ROUTES.assessment,
    icon: CompassIcon,
    accentVar: "--accent-assessment",
  },
  {
    key: "recommendations",
    title: "Career Matches & Insights",
    description:
      "Your Top 5 AI-matched careers with fit scores, salary ranges, and a clear explanation of why each one fits.",
    cta: "See your matches",
    href: ROUTES.recommendations,
    icon: TargetIcon,
    accentVar: "--accent-mentor",
  },
  {
    key: "interviews",
    title: "AI Mock Interviews",
    description: "Practice role-based interviews and get structured, AI-scored feedback on how you did.",
    cta: "Practice an interview",
    href: ROUTES.interviews,
    icon: MicIcon,
    accentVar: "--accent-interview",
  },
  {
    key: "roadmap",
    title: "Learning Roadmap",
    description:
      "Turn any target role into a stage-by-stage roadmap — from fundamentals to advanced, with real milestones.",
    cta: "View a roadmap",
    href: ROUTES.roadmap,
    icon: RouteIcon,
    accentVar: "--accent-roadmap",
  },
  {
    key: "skillgap",
    title: "Skill Gap Analysis",
    description: "See exactly where your current skills fall short of your target role, and what to learn next.",
    cta: "Check your skill gap",
    href: ROUTES.skillGap,
    icon: PuzzleIcon,
    accentVar: "--accent-resume",
  },
  {
    key: "dashboard",
    title: "Progress Dashboard",
    description:
      "Completeness, roadmap progress, interview practice, and matches — your whole journey in one view.",
    cta: "Open the dashboard",
    href: ROUTES.dashboard,
    icon: ChartIcon,
    accentVar: "--accent-assessment",
  },
];

export interface HomeStep {
  key: string;
  index: string;
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  accentVar: string;
}

/** Section 6 — "How CareerVerse works". Only steps with real functionality behind them. */
export const HOW_IT_WORKS: HomeStep[] = [
  {
    key: "discover",
    index: "01",
    title: "Discover",
    description: "Take Career Discovery to map your interests, strengths, and work style.",
    icon: CompassIcon,
    accentVar: "--accent-assessment",
  },
  {
    key: "explore",
    index: "02",
    title: "Explore",
    description: "See your AI-matched careers and browse the catalog to understand why each one fits.",
    icon: GlobeIcon,
    accentVar: "--accent-mentor",
  },
  {
    key: "prepare",
    index: "03",
    title: "Prepare",
    description: "Close skill gaps with a personalized roadmap and practice with AI mock interviews.",
    icon: PuzzleIcon,
    accentVar: "--accent-interview",
  },
  {
    key: "grow",
    index: "04",
    title: "Grow",
    description: "Track your progress on one dashboard as your profile, matches, and readiness evolve.",
    icon: TrendingUpIcon,
    accentVar: "--accent-roadmap",
  },
];

export interface HomeValueStep {
  key: string;
  label: string;
  icon: ComponentType<IconProps>;
}

/** Section 8 — "Discover → Understand → Prepare → Grow" value strip. */
export const VALUE_FLOW: HomeValueStep[] = [
  { key: "discover", label: "Discover", icon: CompassIcon },
  { key: "understand", label: "Understand", icon: LightbulbIcon },
  { key: "prepare", label: "Prepare", icon: PuzzleIcon },
  { key: "grow", label: "Grow", icon: TrendingUpIcon },
];

export interface SampleMatch {
  id: string;
  title: string;
  category: string;
  matchPercent: number;
  explanation: string;
  drivers: string[];
}

/**
 * Illustrative sample matches for the hero/showcase previews. These mirror the
 * real Career Discovery results screen's data shape (see
 * features/assessment/discovery/components/discovery-results.tsx) but are
 * hard-coded, clearly-labeled sample data — never presented as a real user's
 * results or real statistics.
 */
export const SAMPLE_MATCHES: SampleMatch[] = [
  {
    id: "software-engineer",
    title: "Software Engineer",
    category: "Technology",
    matchPercent: 92,
    explanation: "Strong analytical thinking paired with a preference for structured problem solving.",
    drivers: ["Analytical thinking", "Problem solving"],
  },
  {
    id: "data-scientist",
    title: "Data Scientist",
    category: "Technology",
    matchPercent: 87,
    explanation: "Comfort with ambiguity and a pattern-driven approach to open-ended questions.",
    drivers: ["Pattern recognition", "Curiosity"],
  },
  {
    id: "ai-ml-engineer",
    title: "AI/ML Engineer",
    category: "Technology",
    matchPercent: 83,
    explanation: "Technical curiosity combined with systems-level thinking.",
    drivers: ["Systems thinking", "Technical curiosity"],
  },
  {
    id: "product-manager",
    title: "Product Manager",
    category: "Business",
    matchPercent: 76,
    explanation: "A blend of communication strength and strategic, big-picture thinking.",
    drivers: ["Communication", "Strategic thinking"],
  },
];

export interface SampleTrait {
  key: string;
  label: string;
  value: number;
  accentVar: string;
}

/** Illustrative strengths profile shown alongside the sample matches. */
export const SAMPLE_TRAITS: SampleTrait[] = [
  { key: "analytical", label: "Analytical", value: 85, accentVar: "--accent-assessment" },
  { key: "technical", label: "Technical", value: 78, accentVar: "--accent-interview" },
  { key: "communication", label: "Communication", value: 70, accentVar: "--accent-mentor" },
  { key: "creative", label: "Creative", value: 58, accentVar: "--accent-roadmap" },
];

export interface HomeCta {
  label: string;
  href: string;
}

export interface HomeCtaSet {
  heroPrimary: HomeCta;
  heroSecondary: HomeCta;
  finalPrimary: HomeCta;
}

/**
 * Auth-aware CTA copy + destinations. Every href below is a real route — never
 * a placeholder — so the same buttons work correctly whether the visitor is
 * logged out, mid-journey, or has already completed Career Discovery.
 */
export function getHomeCtas(user: { onboardingComplete: boolean } | null): HomeCtaSet {
  if (!user) {
    return {
      heroPrimary: { label: "Take Career Assessment", href: ROUTES.signup },
      heroSecondary: { label: "Explore Careers", href: ROUTES.careers },
      finalPrimary: { label: "Take the Assessment", href: ROUTES.signup },
    };
  }
  if (!user.onboardingComplete) {
    return {
      heroPrimary: { label: "Continue Career Assessment", href: ROUTES.assessment },
      heroSecondary: { label: "Go to Dashboard", href: ROUTES.dashboard },
      finalPrimary: { label: "Take the Assessment", href: ROUTES.assessment },
    };
  }
  return {
    heroPrimary: { label: "View Your Career Matches", href: ROUTES.recommendations },
    heroSecondary: { label: "Go to Dashboard", href: ROUTES.dashboard },
    finalPrimary: { label: "View Your Dashboard", href: ROUTES.dashboard },
  };
}

export interface HomeFooterColumn {
  title: string;
  links: HomeNavLink[];
}

export const FOOTER_COLUMNS: HomeFooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Career Discovery", href: ROUTES.assessment },
      { label: "Career Matches", href: ROUTES.recommendations },
      { label: "Learning Roadmap", href: ROUTES.roadmap },
      { label: "Mock Interviews", href: ROUTES.interviews },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: ROUTES.about },
      { label: "Pricing", href: ROUTES.pricing },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign in", href: ROUTES.login },
      { label: "Get started", href: ROUTES.signup },
    ],
  },
];
