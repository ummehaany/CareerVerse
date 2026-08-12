/*
 * Career Profile — serializable view model. The server query assembles this
 * from the user account, portfolio, and analytics so client components render
 * without any further data access.
 */

export interface ProfileIdentity {
  name: string;
  email: string;
  username: string;
  /** Display path without protocol (careerverse.app/u/<username>). */
  publicPath: string;
  /** Full https URL for copy/share. */
  publicUrl: string;
  photoURL: string | null;
  plan: string;
  role: string;
  joined: string;
  lastActive: string;
}

export interface ProfileCareer {
  careerGoal: string;
  targetCompany: string;
  targetRole: string;
  college: string;
  degree: string;
  gradYear: string;
  bio: string;
  skills: string[];
}

export interface ProfileStats {
  careerReadiness: number;
  resumeScore: number;
  roadmapProgress: number;
  interviewAvg: number | null;
  skillGap: number | null;
  coachSessions: number;
  achievementsUnlocked: number;
  achievementsTotal: number;
  level: number;
  levelTitle: string;
  streak: number;
}

export interface ProfilePageData {
  identity: ProfileIdentity;
  career: ProfileCareer;
  stats: ProfileStats;
  hasAssessment: boolean;
}
