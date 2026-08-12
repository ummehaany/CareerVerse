import type { MemoryEvent } from "@/lib/memory/types";
import type { ProfileVisibility, PublicSection } from "@/lib/profile/public-config";

export interface HealthCategory {
  key: string;
  label: string;
  value: number | null;
}

export interface PublicSkill {
  name: string;
  level: string;
  endorsement?: string;
}

export interface PublicProject {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  demoUrl: string;
  featured: boolean;
}

export interface PublicCertification {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialUrl: string;
}

export interface PublicTargetCompany {
  name: string;
  score: number;
  missing: string[];
  nextSteps: string;
}

export interface PublicAchievement {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PublicResume {
  exists: boolean;
  completion: number;
  atsScore: number | null;
  summary: string;
  topSkills: string[];
  experienceCount: number;
  lastUpdated: string | null;
}

export interface PublicInterview {
  count: number;
  average: number | null;
  best: number | null;
  strong: string[];
  improve: string[];
}

export interface PublicRoadmap {
  exists: boolean;
  title: string | null;
  percent: number;
  milestonesDone: number;
  milestonesTotal: number;
  completed: string[];
  upcoming: string[];
}

export interface PublicSocial {
  linkedin: string;
  github: string;
  website: string;
  twitter: string;
}

export interface PublicProfileStats {
  views: number;
  resumeDownloads: number;
  shares: number;
}

export interface PublicProfileData {
  uid: string;
  username: string;
  visibility: ProfileVisibility;
  isOwner: boolean;
  sections: Record<PublicSection, boolean>;

  // Hero
  name: string;
  headline: string;
  bio: string;
  location: string;
  photoUrl: string | null;
  education: string;
  currentRole: string;
  careerGoal: string;
  dreamCompany: string;

  // Sections
  healthScore: number;
  healthBreakdown: HealthCategory[];
  aiSummary: string;
  skills: PublicSkill[];
  projects: PublicProject[];
  resume: PublicResume;
  timeline: MemoryEvent[];
  certifications: PublicCertification[];
  interview: PublicInterview;
  roadmap: PublicRoadmap;
  targetCompanies: PublicTargetCompany[];
  achievements: PublicAchievement[];
  social: PublicSocial;

  // Owner-only
  stats: PublicProfileStats | null;

  // Links
  profileUrl: string;
  profilePath: string;
}
