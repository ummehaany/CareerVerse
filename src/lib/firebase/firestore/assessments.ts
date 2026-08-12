import { cache } from "react";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import {
  ASSESSMENT_VERSION,
  type AssessmentDoc,
  type Answers,
  type StructuredProfile,
} from "@/types/assessment";

// Repository for `users/{uid}/assessments`. Feature code never touches
// Firestore directly — it goes through these typed functions.

function assessmentsRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("assessments");
}

/** The most recently updated assessment for a user, or null. */
async function getLatestAssessment__impl(uid: string): Promise<AssessmentDoc | null> {
  const snap = await assessmentsRef(uid).orderBy("updatedAt", "desc").limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return { ...(doc.data() as AssessmentDoc), id: doc.id };
}

export interface UpsertDraftInput {
  id?: string | null;
  currentStep: number;
  answers: Answers;
}

/**
 * Create or update the in-progress draft. When `id` is provided the existing
 * doc is merged; otherwise a fresh draft is created and its id returned.
 */
export async function upsertAssessmentDraft(
  uid: string,
  input: UpsertDraftInput,
): Promise<{ id: string }> {
  const collection = assessmentsRef(uid);

  if (input.id) {
    const ref = collection.doc(input.id);
    await ref.set(
      {
        status: "in_progress",
        currentStep: input.currentStep,
        answers: input.answers,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
    return { id: input.id };
  }

  const ref = collection.doc();
  await ref.set({
    type: "onboarding",
    schemaVersion: ASSESSMENT_VERSION,
    status: "in_progress",
    currentStep: input.currentStep,
    answers: input.answers,
    completionPercent: 0,
    structured: null,
    aiCareerProfile: null,
    startedAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
    completedAt: null,
  });
  return { id: ref.id };
}

export interface FinalizeInput {
  answers: Answers;
  currentStep: number;
  structured: StructuredProfile;
  completionPercent: number;
}

/** Mark a draft complete and persist the derived structured profile. */
export async function finalizeAssessment(
  uid: string,
  id: string,
  input: FinalizeInput,
): Promise<void> {
  await assessmentsRef(uid)
    .doc(id)
    .set(
      {
        status: "completed",
        answers: input.answers,
        currentStep: input.currentStep,
        structured: input.structured,
        completionPercent: input.completionPercent,
        updatedAt: FieldValue.serverTimestamp(),
        completedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

/** Request-memoized: dedupes identical per-user reads within a single render (I3). */
export const getLatestAssessment = cache(getLatestAssessment__impl);
