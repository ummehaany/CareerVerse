import { cache } from "react";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import type { User } from "@/types";
import { defaultEmailPreferences, type EmailCategory } from "@/lib/email/types";
import { defaultProfileSections } from "@/lib/profile/public-config";
import { defaultPrivacyPreferences, type PrivacyCategory } from "@/lib/privacy/types";

const COLLECTION = "users";

async function getUser__impl(uid: string): Promise<User | null> {
  const snap = await adminDb.collection(COLLECTION).doc(uid).get();
  return snap.exists ? (snap.data() as User) : null;
}

interface EnsureUserParams {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  provider?: string | null;
}

/**
 * Idempotently create the `users/{uid}` document with default fields.
 * If it already exists, only the activity timestamp is refreshed. Called on
 * every session creation so Google first-logins are bootstrapped too.
 * Returns true only when the document was newly created (first sign-in).
 */
export async function ensureUser({ uid, email, displayName, photoURL, provider }: EnsureUserParams): Promise<boolean> {
  const ref = adminDb.collection(COLLECTION).doc(uid);
  const snap = await ref.get();

  if (snap.exists) {
    await ref.set(
      { lastActiveAt: FieldValue.serverTimestamp(), ...(provider ? { provider } : {}) },
      { merge: true },
    );
    return false;
  }

  await ref.set({
    uid,
    email,
    displayName,
    photoURL,
    provider: provider ?? null,
    role: "student",
    onboardingComplete: false,
    tourCompletedAt: null,
    plan: "free",
    planStatus: "none",
    usageResetDate: null,
    monthlyUsage: { period: new Date().toISOString().slice(0, 7), careerPlanning: 0, resumeAI: 0, mockInterview: 0, careerInsights: 0 },
    emailPreferences: defaultEmailPreferences(),
    profileVisibility: "unlisted",
    profileSections: defaultProfileSections(),
    privacyPreferences: defaultPrivacyPreferences(),
    onboarding: {
      completed: false,
      careerGoal: null,
      careerField: null,
      currentLevel: null,
      targetCompanies: [],
      tourCompleted: false,
      completedAt: null,
    },
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastActiveAt: FieldValue.serverTimestamp(),
  });
  return true;
}

/** Flip the onboarding gate — set once the user completes their assessment. */
export async function setOnboardingComplete(uid: string, complete = true): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .set(
      { onboardingComplete: complete, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
}

/** Product-tour gate. Pass a value to mark complete (server timestamp) or reset (null). */
export async function setTourCompleted(uid: string, completed: boolean): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .set(
      { tourCompletedAt: completed ? FieldValue.serverTimestamp() : null, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
}

/** Persist a single email-category preference (used by Settings). */
export async function setEmailPreference(uid: string, category: EmailCategory, enabled: boolean): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .set(
      { emailPreferences: { [category]: enabled }, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
}

/** Persist a single privacy preference (used by Settings). */
export async function setPrivacyPreference(uid: string, category: PrivacyCategory, enabled: boolean): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .set(
      { privacyPreferences: { [category]: enabled }, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
}

/**
 * Update editable profile identity fields (display name and/or avatar URL).
 * Only the keys provided are written, so callers can change one without the
 * other. `photoURL: null` clears the avatar. Never touches auth/email fields.
 */
export async function updateUserProfile(
  uid: string,
  patch: { displayName?: string; photoURL?: string | null },
): Promise<void> {
  const data: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };
  if (patch.displayName !== undefined) data.displayName = patch.displayName;
  if (patch.photoURL !== undefined) data.photoURL = patch.photoURL;
  await adminDb.collection(COLLECTION).doc(uid).set(data, { merge: true });
}

/** Personalization answers captured during first-run onboarding (Steps 2–5). */
export interface OnboardingInput {
  careerGoal: string | null;
  careerField: string | null;
  currentLevel: string | null;
  targetCompanies: string[];
}

/**
 * Persist completed onboarding: stores the personalization answers and marks
 * `onboarding.completed`. Merged, so it never disturbs other user fields and is
 * distinct from `onboardingComplete` (assessment).
 */
export async function completeOnboarding(uid: string, input: OnboardingInput): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .set(
      {
        onboarding: {
          ...input,
          completed: true,
          completedAt: FieldValue.serverTimestamp(),
        },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

/** Mark onboarding as completed without personalization (user chose "Skip setup"). */
export async function skipOnboarding(uid: string): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .set(
      {
        onboarding: { completed: true, completedAt: FieldValue.serverTimestamp() },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

/** Sync the onboarding record's tour flag (mirrors the existing tour state). */
export async function setOnboardingTourCompleted(uid: string, completed: boolean): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .set(
      { onboarding: { tourCompleted: completed }, updatedAt: FieldValue.serverTimestamp() },
      { merge: true },
    );
}

/** Request-memoized: dedupes identical per-user reads within a single render (I3). */
export const getUser = cache(getUser__impl);
