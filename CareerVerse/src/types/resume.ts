import type { FirestoreTimestamp } from "./user";

export const RESUME_VERSION = 1;

export type ResumeTemplate = "classic" | "modern";

export interface ResumeContact {
  fullName: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
}

export interface ResumeExperience {
  id: string;
  role: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface ResumeEducation {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  details: string;
}

export interface ResumeProject {
  id: string;
  name: string;
  description: string;
  link: string;
}

export interface ResumeCertification {
  id: string;
  name: string;
  issuer: string;
  year: string;
}

/** `users/{uid}/resumes/{id}` — a single resume document (id "primary"). */
export interface ResumeDoc {
  id: string;
  template: ResumeTemplate;
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
  schemaVersion: number;
  createdAt: FirestoreTimestamp | null;
  updatedAt: FirestoreTimestamp | null;
}

/** Serializable resume payload used by the client editor + save action. */
export interface ResumeData {
  template: ResumeTemplate;
  contact: ResumeContact;
  summary: string;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  skills: string[];
  projects: ResumeProject[];
  certifications: ResumeCertification[];
}
