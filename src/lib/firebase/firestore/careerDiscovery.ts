import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { notifyAssessmentResultsReady } from "@/lib/email/triggers";
import type { Answers } from "@/types/assessment";
import type { CareerMatch } from "@/features/assessment/discovery/types";

/*
 * Career Discovery — extra persistence on top of `users/{uid}/assessments`.
 *
 * Deliberately isolated from `firestore/assessments.ts`: it never edits that
 * file, it only merges one additional `careerDiscovery` field onto the same
 * document that `upsertAssessmentDraft` / `finalizeAssessment` already write.
 * This keeps every other module that reads `users/{uid}/assessments`
 * (Roadmap, Recommendations, Resume, Skill Gap, Compare, Portfolio,
 * Companies, Career Coach memory, Dashboard) working unmodified, while
 * storing Career Discovery's own basic/advanced answers + recommendations
 * without duplicating the `answers` / `structured` fields those functions
 * already persist.
 */

function assessmentsRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("assessments");
}

export interface CareerDiscoveryData {
  completed: boolean;
  basicAnswers: Answers;
  advancedAnswers: Answers | null;
  advancedCompleted: boolean;
  recommendations: CareerMatch[];
  /** Optional, display-only free text ("a career you've been curious about") — never scored. */
  curiosityNote?: string | null;
}

export async function saveCareerDiscovery(
  uid: string,
  assessmentId: string,
  data: CareerDiscoveryData,
): Promise<void> {
  await assessmentsRef(uid)
    .doc(assessmentId)
    .set(
      {
        careerDiscovery: {
          ...data,
          updatedAt: FieldValue.serverTimestamp(),
        },
      },
      { merge: true },
    );

  // Fire-and-forget: notify the student their results are ready. Fires on
  // every completed save (both the initial basic completion and a later
  // advanced-refinement save reuse this same assessmentId), but
  // `notifyAssessmentResultsReady`'s per-assessment dedupe key ensures only
  // the first one actually sends an email — never on a merely-started
  // assessment, since this only runs when `data.completed` is true.
  if (data.completed) {
    void notifyAssessmentResultsReady(uid, assessmentId, data.recommendations[0]?.title ?? null);
  }
}

/** Raw read of the `careerDiscovery` blob off a given assessment doc. */
export async function getCareerDiscovery(
  uid: string,
  assessmentId: string,
): Promise<(CareerDiscoveryData & { updatedAt: unknown }) | null> {
  const snap = await assessmentsRef(uid).doc(assessmentId).get();
  if (!snap.exists) return null;
  const data = snap.data();
  return (data?.careerDiscovery as (CareerDiscoveryData & { updatedAt: unknown })) ?? null;
}
