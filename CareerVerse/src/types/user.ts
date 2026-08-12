import type { EmailCategory } from "@/lib/email/types";
import type { ProfileVisibility, PublicSection } from "@/lib/profile/public-config";
import type { PrivacyCategory } from "@/lib/privacy/types";

export type UserRole = "student" | "professional" | "admin";
export type UserPlan = "free" | "pro";

/** Minimal, SDK-agnostic shape of a Firestore Timestamp (decouples types from admin/client SDKs). */
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

/**
 * First-run onboarding record (Steps 1–6 personalization answers + completion).
 * Intentionally SEPARATE from `onboardingComplete` (which tracks Career
 * Assessment completion) so the two never collide. Only ever set for accounts
 * created after this feature shipped; absent on grandfathered users.
 */
export interface OnboardingProfile {
  completed: boolean;
  careerGoal: string | null;
  /**
   * A real field name, `null` (unanswered), or the "Not sure yet" sentinel
   * (`CAREER_FIELD_UNDECIDED` in `features/onboarding/flow-config`). Always
   * read through `resolveCareerField()` before displaying or using this.
   */
  careerField: string | null;
  currentLevel: string | null;
  targetCompanies: string[];
  /** Whether the product tour (reused existing spotlight tour) has finished. */
  tourCompleted: boolean;
  completedAt?: FirestoreTimestamp | null;
}

/** `users/{uid}` — account core. */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  /** Firebase sign-in provider (e.g. "password", "google.com", "github.com"). */
  provider?: string | null;
  role: UserRole;
  onboardingComplete: boolean;
  /** First-run product tour completion (null until finished/skipped). */
  tourCompletedAt?: FirestoreTimestamp | null;
  plan: UserPlan;
  /** Subscription status (payment provider added later). */
  planStatus?: "none" | "active" | "canceled" | "past_due";
  /** ISO date the free monthly allowance resets (first of next month, UTC). */
  usageResetDate?: string | null;
  /** Per-feature monthly usage counters for the Free plan. */
  monthlyUsage?: {
    period: string;
    careerPlanning: number;
    resumeAI: number;
    mockInterview: number;
    careerInsights: number;
  };
  /** Per-category email notification preferences (default: all enabled). */
  emailPreferences?: Partial<Record<EmailCategory, boolean>>;
  /** Public profile handle at /u/{username} (reserved lazily). */
  username?: string;
  /** Public profile visibility (default: unlisted). */
  profileVisibility?: ProfileVisibility;
  /** Per-section visibility on the public profile (default: all on). */
  profileSections?: Partial<Record<PublicSection, boolean>>;
  /** Per-category privacy preferences (default: see defaultPrivacyPreferences()). */
  privacyPreferences?: Partial<Record<PrivacyCategory, boolean>>;
  /** First-run onboarding personalization + completion (new accounts only). */
  onboarding?: OnboardingProfile;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  lastActiveAt: FirestoreTimestamp;
}
