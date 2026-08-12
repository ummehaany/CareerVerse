/*
 * Career Planning Engine — the structured career report the engine produces in
 * a single response. Fully serializable so the server action hands a finished
 * plan to the client renderer; no chat, no follow-up turns.
 */

export type PlanDifficulty = "Beginner" | "Intermediate" | "Advanced";
export type PlanSource = "ai" | "curated";

export interface PlanOverview {
  what: string;
  suitableFor: string;
  responsibilities: string[];
}

export interface PlanRoadmapMonth {
  month: number;
  label: string;
  focus: string[];
}

export interface PlanProject {
  name: string;
  difficulty: PlanDifficulty;
  skills: string[];
  description: string;
}

export interface PlanCourses {
  free: string[];
  paid: string[];
}

export interface PlanResources {
  books: string[];
  documentation: string[];
  youtube: string[];
  practice: string[];
}

export interface PlanSalary {
  entry: string;
  mid: string;
  senior: string;
  note: string;
}

export interface PlanInterviewPrep {
  technicalTopics: string[];
  hrQuestions: string[];
  coding: string[];
  aptitude: string[];
}

export interface PlanResumeTips {
  skillsToHighlight: string[];
  projectsToInclude: string[];
  certifications: string[];
  portfolio: string[];
}

export interface PlanWeek {
  week: number;
  focus: string;
}

/** The complete, structured career report rendered as cards. */
export interface CareerPlan {
  careerTitle: string;
  overview: PlanOverview;
  skills: string[];
  roadmap: PlanRoadmapMonth[];
  projects: PlanProject[];
  courses: PlanCourses;
  resources: PlanResources;
  salary: PlanSalary;
  tools: string[];
  interviewPrep: PlanInterviewPrep;
  resumeTips: PlanResumeTips;
  weeklyPlan: PlanWeek[];
  source: PlanSource;
  /** True when the user's own CareerVerse data seeded/enriched this plan. */
  personalized: boolean;
}
