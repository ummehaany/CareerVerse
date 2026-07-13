export type UserRole = "student" | "professional" | "admin";
export type UserPlan = "free" | "pro";

/** Minimal, SDK-agnostic shape of a Firestore Timestamp (decouples types from admin/client SDKs). */
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
}

/** `users/{uid}` — account core. */
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: UserRole;
  onboardingComplete: boolean;
  plan: UserPlan;
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
  lastActiveAt: FirestoreTimestamp;
}
