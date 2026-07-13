import { adminDb, FieldValue } from "@/lib/firebase/admin";
import {
  RECOMMENDATION_VERSION,
  type CareerRecommendation,
  type RecommendationSetDoc,
} from "@/types/recommendation";

// Repository for `users/{uid}/recommendations`.

function recommendationsRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("recommendations");
}

/** The most recently generated recommendation set for a user, or null. */
export async function getLatestRecommendationSet(uid: string): Promise<RecommendationSetDoc | null> {
  const snap = await recommendationsRef(uid).orderBy("createdAt", "desc").limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return { ...(doc.data() as RecommendationSetDoc), id: doc.id };
}

export interface SaveRecommendationsInput {
  assessmentId: string;
  provider: string;
  model: string;
  recommendations: CareerRecommendation[];
}

/** Persist a freshly generated set. Regeneration creates a new document. */
export async function saveRecommendationSet(
  uid: string,
  input: SaveRecommendationsInput,
): Promise<{ id: string }> {
  const ref = recommendationsRef(uid).doc();
  await ref.set({
    assessmentId: input.assessmentId,
    provider: input.provider,
    model: input.model,
    schemaVersion: RECOMMENDATION_VERSION,
    recommendations: input.recommendations,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id };
}
