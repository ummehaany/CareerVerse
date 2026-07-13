import { adminDb, FieldValue } from "@/lib/firebase/admin";
import type { User } from "@/types";

const COLLECTION = "users";

export async function getUser(uid: string): Promise<User | null> {
  const snap = await adminDb.collection(COLLECTION).doc(uid).get();
  return snap.exists ? (snap.data() as User) : null;
}

interface EnsureUserParams {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

/**
 * Idempotently create the `users/{uid}` document with default fields.
 * If it already exists, only the activity timestamp is refreshed. Called on
 * every session creation so Google first-logins are bootstrapped too.
 */
export async function ensureUser({ uid, email, displayName, photoURL }: EnsureUserParams): Promise<void> {
  const ref = adminDb.collection(COLLECTION).doc(uid);
  const snap = await ref.get();

  if (snap.exists) {
    await ref.update({ lastActiveAt: FieldValue.serverTimestamp() });
    return;
  }

  await ref.set({
    uid,
    email,
    displayName,
    photoURL,
    role: "student",
    onboardingComplete: false,
    plan: "free",
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    lastActiveAt: FieldValue.serverTimestamp(),
  });
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
