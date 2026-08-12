/*
 * Cross-module intelligence — shared types.
 *
 * The intelligence layer is the "brain" that ties every CareerVerse module
 * together: it reads the already-aggregated signals (assessment, matches,
 * resume, roadmap, interviews, skill gap, target company, streak) and turns them
 * into one coherent, ranked set of insights and next-best-actions. Everything is
 * serializable so server queries hand a finished payload to client components.
 */

export type IntelContext =
  | "assessment"
  | "recommendations"
  | "roadmap"
  | "resume"
  | "interview"
  | "skills"
  | "companies"
  | "careers"
  | "general";

/** Plain, serializable signals gathered from across the platform. */
export interface IntelSignals {
  onboardingComplete: boolean;
  hasProfileData: boolean;
  recommendationsCount: number;
  topMatchTitle: string | null;
  hasResume: boolean;
  resumeCompletion: number;
  resumeSummary: string;
  resumeExperienceCount: number;
  resumeProjectsCount: number;
  roadmapExists: boolean;
  roadmapPercent: number;
  nextMilestone: { title: string; stage: string } | null;
  interviewsCount: number;
  interviewBest: number | null;
  skillReadiness: number | null;
  streak: number;
  target: TargetCompanyProgress | null;
}

export interface TargetCompanyProgress {
  name: string;
  slug: string;
  brand: string;
  readiness: number;
  nextTask: string;
  missingSkills: string[];
}

/** A single ranked, actionable recommendation. */
export interface NextBestAction {
  id: string;
  context: IntelContext;
  title: string;
  detail: string;
  href: string;
  cta: string;
  icon: string;
  accentVar: string;
  priority: number;
}

/** The finished intelligence payload rendered across the app. */
export interface IntelligenceData {
  readiness: number;
  onboardingComplete: boolean;
  hasProfileData: boolean;
  priorityTask: NextBestAction | null;
  recommendations: NextBestAction[];
  nextMilestone: { title: string; stage: string } | null;
  resumeSuggestion: string;
  target: TargetCompanyProgress | null;
  recentInsight: string;
  weeklySummary: string;
}
