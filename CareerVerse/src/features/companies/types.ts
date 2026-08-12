import type { CompanyCardData, CompanyProfile, CompanyRole } from "@/lib/companies/types";

/** A serializable snapshot of the user's CareerVerse profile for the engines. */
export interface UserSnapshot {
  skills: string[];
  strongSkills: string[];
  learningSkills: string[];
  hasResume: boolean;
  resumeSkills: string[];
  resumeSummary: string;
  resumeProjectsCount: number;
  resumeCertsCount: number;
  resumeExperienceCount: number;
  resumeCompletion: number;
  interviewBest: number | null;
  roadmapCompletion: number;
  skillReadiness: number | null;
  targetRoles: string[];
  hasProfileData: boolean;
}

export type Confidence = "High" | "Medium" | "Low";

export interface ReadinessResult {
  score: number;
  confidence: Confidence;
  strong: string[];
  improve: string[];
  missing: string[];
  gapSummary: string;
  prepTime: string;
  roleTitle: string;
}

export interface RoadmapStep {
  title: string;
  detail: string;
  items: string[];
}

export interface RoadmapPhase {
  phase: string;
  timeframe: string;
  focus: string;
  milestones: string[];
}

export interface CompanyRoadmap {
  title: string;
  summary: string;
  steps: RoadmapStep[];
  timeline: RoadmapPhase[];
}

export interface ResumeMatchResult {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  atsSuggestions: string[];
  formatting: string[];
  missingProjects: boolean;
  missingAchievements: boolean;
  hasResume: boolean;
}

export interface InterviewQuestionGroup {
  category: string;
  icon: string;
  questions: string[];
}

export interface InterviewKit {
  roleTitle: string;
  groups: InterviewQuestionGroup[];
  tips: string[];
}

/** Home-page data. */
export interface CompaniesHomeData {
  companies: CompanyCardData[];
  categories: string[];
  dashboard: CompanyDashboardData;
}

export interface SavedCompanyView extends CompanyCardData {
  readiness: number;
}

/** Personalized spotlight for the user's #1 target company. */
export interface DreamSpotlight {
  name: string;
  slug: string;
  brand: string;
  roleTitle: string;
  score: number;
  confidence: Confidence;
  prepTime: string;
  preparation: number;
  nextTask: string;
  remainingSkills: string[];
}

export interface CompanyDashboardData {
  saved: SavedCompanyView[];
  dream: SavedCompanyView[];
  recent: CompanyCardData[];
  savedCount: number;
  dreamCount: number;
  roadmapCompletion: number;
  interviewReadiness: number | null;
  resumeReadiness: number;
  topPick: { name: string; slug: string; score: number } | null;
  dreamSpotlight: DreamSpotlight | null;
}

/** Detail-page data. */
export interface CompanyDetailData {
  profile: CompanyProfile;
  user: UserSnapshot;
  defaultRoleKey: string;
  isSaved: boolean;
  isDream: boolean;
}

/** Re-exported for convenience in components. */
export type { CompanyProfile, CompanyRole, CompanyCardData };
