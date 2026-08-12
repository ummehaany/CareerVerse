/*
 * AI Career Coach — shared types. Everything here is serializable so it can
 * cross the server/client boundary and, later, map cleanly onto an LLM API.
 */

export type CoachRole = "user" | "assistant";

export interface CoachTurn {
  role: CoachRole;
  content: string;
}

export interface Conversation {
  id: string;
  title: string;
  pinned: boolean;
  messages: CoachTurn[];
  updatedAtMs: number | null;
}

/** Aggregated snapshot of the user's CareerVerse data the coach reasons over. */
export interface CoachContext {
  firstName: string;
  hasData: boolean;
  careerMatch: { title: string; fit: number } | null;
  dreamCompany: {
    name: string;
    slug: string;
    readiness: number;
    roleTitle: string;
    prepTime: string;
  } | null;
  hasResume: boolean;
  resumeCompletion: number;
  roadmap: { title: string; percent: number } | null;
  nextMilestone: string | null;
  skillReadiness: number | null;
  careerReadiness: number;
  strongestSkill: string | null;
  biggestGap: string | null;
  strongSkills: string[];
  missingSkills: string[];
  interviewBest: number | null;
  targetRoles: string[];
  /**
   * First-run onboarding answers, present only when at least one was
   * actually given (never set for skipped onboarding). Used to personalize
   * guidance before Career Discovery has run — once real assessment/roadmap
   * data exists (`hasData`), Career Discovery remains the source of truth.
   */
  onboarding: {
    careerGoal: string | null;
    careerField: string | null;
    currentLevel: string | null;
  } | null;
}

export interface CoachInsight {
  key: string;
  label: string;
  value: string;
  detail: string;
  accentVar: string;
  tone: "default" | "good" | "warn";
}

export interface CoachRecommendationGroup {
  category: string;
  icon: string;
  items: string[];
}

export interface CoachHomeData {
  context: CoachContext;
  conversations: Conversation[];
  suggestedPrompts: string[];
  insights: CoachInsight[];
  recommendations: CoachRecommendationGroup[];
  dailyAdvice: string;
  todaysPriority: string;
  aiConfigured: boolean;
}

export interface CoachWidgetData {
  dailyAdvice: string;
  todaysPriority: string;
  careerReadiness: number;
  progress: { label: string; value: number }[];
}
