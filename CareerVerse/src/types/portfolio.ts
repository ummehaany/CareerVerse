import type { FirestoreTimestamp } from "./user";

/** Bump when the portfolio shape changes. */
export const PORTFOLIO_VERSION = 1;

export type SkillLevel = "beginner" | "intermediate" | "advanced" | "expert";
export type WorkMode = "remote" | "hybrid" | "onsite" | "";
export type AchievementType =
  | "award"
  | "competition"
  | "internship"
  | "leadership"
  | "other";

export interface PortfolioSkill {
  name: string;
  level: SkillLevel;
}

export interface PortfolioEducation {
  id: string;
  school: string;
  degree: string;
  field: string;
  startYear: string;
  endYear: string;
}

export interface PortfolioProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl: string;
}

export interface PortfolioCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
}

export interface PortfolioAchievement {
  id: string;
  title: string;
  type: AchievementType;
  organization: string;
  date: string;
  description: string;
}

export interface PortfolioPersonal {
  fullName: string;
  headline: string;
  photoUrl: string;
  bio: string;
  careerGoal: string;
  location: string;
  email: string;
  phone: string;
}

export interface PortfolioCareerGoals {
  dreamJob: string;
  targetCompany: string;
  targetSalary: string;
  workMode: WorkMode;
}

export interface PortfolioSocial {
  linkedin: string;
  github: string;
  website: string;
  twitter: string;
}

/**
 * Editable, fully-serializable portfolio content (no Firestore timestamps).
 * This is what the client edits and what the save action validates.
 */
export interface Portfolio {
  personal: PortfolioPersonal;
  education: PortfolioEducation[];
  technicalSkills: PortfolioSkill[];
  softSkills: PortfolioSkill[];
  projects: PortfolioProject[];
  certifications: PortfolioCertification[];
  achievements: PortfolioAchievement[];
  careerGoals: PortfolioCareerGoals;
  social: PortfolioSocial;
}

/** `portfolios/{uid}` — persisted portfolio document. */
export interface PortfolioDoc extends Portfolio {
  uid: string;
  schemaVersion: number;
  createdAt: FirestoreTimestamp | null;
  updatedAt: FirestoreTimestamp | null;
}
