import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import {
  CompassIcon,
  TargetIcon,
  RouteIcon,
  SparklesIcon,
  FileTextIcon,
  ChartIcon,
  ClockIcon,
  LightbulbIcon,
  GlobeIcon,
  TrendingUpIcon,
  ShieldIcon,
  BookIcon,
} from "@/components/ui/icon";

/*
 * Static content for the About page. Kept data-driven so the page stays a thin
 * composition layer — mirrors the pattern used by dashboard/config.ts and
 * config/nav.ts. Purely additive; imported by nothing else.
 */

export interface AboutItem {
  key: string;
  title: string;
  description: string;
  icon: ComponentType<IconProps>;
  accentVar: string;
}

/** Section 3 — How CareerVerse works (4 cards). */
export const HOW_IT_WORKS: AboutItem[] = [
  {
    key: "explore",
    title: "Explore Careers",
    description:
      "Browse 100+ curated careers with real skills, salaries, demand, and growth paths — all in one place.",
    icon: CompassIcon,
    accentVar: "--accent-assessment",
  },
  {
    key: "match",
    title: "Career Match",
    description:
      "Take a smart assessment and get your Top 5 AI-matched careers, ranked by how well they fit you.",
    icon: TargetIcon,
    accentVar: "--accent-mentor",
  },
  {
    key: "roadmap",
    title: "Learning Roadmap",
    description:
      "Turn any target role into a stage-by-stage plan — from fundamentals to advanced, with projects and certs.",
    icon: RouteIcon,
    accentVar: "--accent-roadmap",
  },
  {
    key: "growth",
    title: "Growth Tracking",
    description:
      "Track progress across milestones and readiness, with an AI coach guiding what to do next.",
    icon: TrendingUpIcon,
    accentVar: "--accent-interview",
  },
];

/** Section 4 — Why choose CareerVerse (feature cards). */
export const FEATURES: AboutItem[] = [
  {
    key: "recommendations",
    title: "AI Career Recommendations",
    description: "Personalized Top 5 matches with fit scores, salary ranges, and next steps.",
    icon: SparklesIcon,
    accentVar: "--accent-mentor",
  },
  {
    key: "roadmaps",
    title: "Personalized Learning Roadmaps",
    description: "Beginner → advanced paths tailored to your current level and goals.",
    icon: RouteIcon,
    accentVar: "--accent-roadmap",
  },
  {
    key: "resume",
    title: "Resume Builder",
    description: "Craft a clean, ATS-friendly resume and export it to PDF in minutes.",
    icon: FileTextIcon,
    accentVar: "--accent-resume",
  },
  {
    key: "progress",
    title: "Career Progress Tracking",
    description: "Watch completeness, roadmap progress, and readiness climb as you grow.",
    icon: ChartIcon,
    accentVar: "--accent-assessment",
  },
  {
    key: "assessments",
    title: "Assessments",
    description: "A thoughtful questionnaire that builds the profile powering everything.",
    icon: CompassIcon,
    accentVar: "--accent-interview",
  },
  {
    key: "timeline",
    title: "Career Timeline",
    description: "See your journey and milestones laid out on a clear, motivating timeline.",
    icon: ClockIcon,
    accentVar: "--accent-mentor",
  },
  {
    key: "skills",
    title: "Skill Development",
    description: "Spot skill gaps, mark what you've learned, and close them with curated resources.",
    icon: LightbulbIcon,
    accentVar: "--accent-roadmap",
  },
];

export interface AboutStat {
  key: string;
  label: string;
  value: number;
  suffix: string;
  icon: ComponentType<IconProps>;
  accentVar: string;
}

/**
 * Section 5 — Platform highlights (animated counters).
 * Emptied out: none of the previous figures (careers, students, roadmaps,
 * assessments) were backed by verified real data, so none are shown until
 * real, verifiable numbers are available.
 */
export const STATS: AboutStat[] = [];

/** Section 6 — Core values. */
export const VALUES: AboutItem[] = [
  {
    key: "innovation",
    title: "Innovation",
    description: "We put modern AI to work on a decades-old problem: choosing a career with confidence.",
    icon: LightbulbIcon,
    accentVar: "--accent-interview",
  },
  {
    key: "accessibility",
    title: "Accessibility",
    description: "Guidance shouldn't be a privilege. CareerVerse is built to be clear, inclusive, and open to all.",
    icon: GlobeIcon,
    accentVar: "--accent-roadmap",
  },
  {
    key: "personalization",
    title: "Personalization",
    description: "Every roadmap, match, and tip is shaped by who you are — not a generic template.",
    icon: TargetIcon,
    accentVar: "--accent-mentor",
  },
  {
    key: "growth",
    title: "Growth",
    description: "We measure success by the progress you make, one skill and milestone at a time.",
    icon: TrendingUpIcon,
    accentVar: "--accent-assessment",
  },
  {
    key: "trust",
    title: "Trust",
    description: "Honest, transparent guidance — clear about what's a projection and what's a certainty.",
    icon: ShieldIcon,
    accentVar: "--accent-resume",
  },
  {
    key: "lifelong",
    title: "Lifelong Learning",
    description: "Careers evolve. CareerVerse is a companion for every stage, not a one-time answer.",
    icon: BookIcon,
    accentVar: "--accent-roadmap",
  },
];

export interface Faq {
  q: string;
  a: string;
}

/** Section 8 — FAQ. */
export const FAQS: Faq[] = [
  {
    q: "What is CareerVerse?",
    a: "CareerVerse is an AI-powered career companion that helps students and professionals discover careers, get matched to the right paths, build learning roadmaps, and grow with personalized guidance — all in one place.",
  },
  {
    q: "How does the career assessment work?",
    a: "You answer a short, thoughtful questionnaire about your interests, skills, values, and goals. CareerVerse turns those answers into a structured profile that powers your recommendations, roadmaps, and coaching.",
  },
  {
    q: "How are my career matches generated?",
    a: "We analyze your assessment profile against our curated career catalog to surface your Top 5 matches with fit scores, salary ranges, and next steps. When AI is unavailable, a built-in engine still delivers high-quality matches instantly.",
  },
  {
    q: "Are the salary figures accurate for India?",
    a: "Salaries are shown in ₹ LPA using realistic, role-specific Indian market bands (with an optional USD view). They're illustrative ranges to guide planning — not guarantees.",
  },
  {
    q: "Do I need to pay to use CareerVerse?",
    a: "You can explore careers, take assessments, get recommendations, and build roadmaps on the free plan. Advanced capabilities are part of upgraded plans as the platform grows.",
  },
  {
    q: "Is my data private and secure?",
    a: "Your profile is tied to your account and used only to personalize your experience. We're transparent about how guidance is generated and never sell your data.",
  },
  {
    q: "Can CareerVerse help if I'm switching careers?",
    a: "Absolutely. Compare careers side by side, see your skill gap for any role, and generate a roadmap that starts from where you are today — whether you're a student or an experienced professional.",
  },
  {
    q: "What happens after I complete a roadmap?",
    a: "You can track progress across milestones, revisit or regenerate roadmaps as your goals shift, and lean on the AI coach for what to focus on next. CareerVerse grows with you.",
  },
];
