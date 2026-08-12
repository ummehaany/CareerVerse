import type { CollectionReference } from "firebase-admin/firestore";
import { adminDb, adminAuth, FieldValue } from "@/lib/firebase/admin";

/**
 * Account-level data operations: a true personalization RESET and a full
 * account DELETE. Both enumerate every per-user data location in the app so
 * nothing is left orphaned. Server-only (Admin SDK).
 */

/** Per-user subcollections under `users/{uid}` that hold personalization. */
const PERSONALIZATION_SUBCOLLECTIONS = [
  "assessments", // Career Discovery / assessment responses + structured profile
  "recommendations",
  "roadmaps",
  "resumes",
  "interviews", // interview history + AI insights
  "skillAssessments",
  "skillProgress",
  "gamification", // streaks / Career Health inputs
  "coachConversations", // AI conversation memory
  "dreamCompanies", // preferred companies
  "bookmarks", // saved learning
  "careerFavorites",
  "memory", // AI memory augment
  "publicProfile", // generated AI summary + view/share stats
] as const;

/** Top-level docs keyed by uid that hold personalization. */
function personalizationDocs(uid: string) {
  return [adminDb.collection("careerProfiles").doc(uid), adminDb.collection("portfolios").doc(uid)];
}

/** Batch-delete every document in a collection (shallow; our subcollections are flat). */
async function deleteCollectionDocs(ref: CollectionReference, batchSize = 300): Promise<void> {
  for (;;) {
    const snap = await ref.limit(batchSize).get();
    if (snap.empty) break;
    const batch = adminDb.batch();
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    if (snap.size < batchSize) break;
  }
}

/**
 * Reset ALL personalized data for a user while preserving their account,
 * subscription/billing, and notification preferences. After this the app
 * behaves like a brand-new account (onboarding gate re-opens).
 */
export async function resetPersonalization(uid: string): Promise<void> {
  const userRef = adminDb.collection("users").doc(uid);

  await Promise.all(
    PERSONALIZATION_SUBCOLLECTIONS.map((name) => deleteCollectionDocs(userRef.collection(name))),
  );
  await Promise.all(personalizationDocs(uid).map((ref) => ref.delete().catch(() => {})));

  // Reopen the onboarding gate so the user is prompted to start Career Discovery.
  await userRef.set({ onboardingComplete: false, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export interface DeleteAccountResult {
  ok: boolean;
  authDeleted: boolean;
  error?: string;
}

/**
 * Permanently delete every piece of data owned by the account, then the account
 * document and the Firebase Auth user. Fails gracefully — data is removed before
 * auth so a transient auth error never leaves orphaned documents.
 */
export async function deleteAllUserData(uid: string): Promise<DeleteAccountResult> {
  const userRef = adminDb.collection("users").doc(uid);

  try {
    // Capture the reserved public username (registry) before deleting the doc.
    const snap = await userRef.get();
    const username = (snap.data()?.username as string | undefined) ?? null;

    await Promise.all(
      PERSONALIZATION_SUBCOLLECTIONS.map((name) => deleteCollectionDocs(userRef.collection(name))),
    );

    const auxDocs = [
      ...personalizationDocs(uid),
      adminDb.collection("usage").doc(uid),
      adminDb.collection("emailLogs").doc(uid),
    ];
    if (username) auxDocs.push(adminDb.collection("usernames").doc(username));
    await Promise.all(auxDocs.map((ref) => ref.delete().catch(() => {})));

    await userRef.delete();
  } catch (error) {
    return { ok: false, authDeleted: false, error: error instanceof Error ? error.message : "data-delete-failed" };
  }

  // Delete the auth user last. If this fails, data is already gone (no orphans).
  try {
    await adminAuth.deleteUser(uid);
    return { ok: true, authDeleted: true };
  } catch (error) {
    console.error("[account] auth deleteUser failed:", error instanceof Error ? error.message : error);
    return { ok: true, authDeleted: false, error: "auth-delete-failed" };
  }
}
