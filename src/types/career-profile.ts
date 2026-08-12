import type { FirestoreTimestamp } from "./user";

export interface SkillRef {
  skillId: string;
  level: number;
}

/** `careerProfiles/{uid}` — the rich, evolving career profile. */
export interface CareerProfile {
  uid: string;
  education: string[];
  experience: string[];
  currentRole: string | null;
  skills: SkillRef[];
  interests: string[];
  goals: string[];
  targetRoles: string[];
  strengths: string[];
  aiSummary: string | null;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}
