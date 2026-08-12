import { adminDb, FieldValue } from "@/lib/firebase/admin";
import type { LearningResource } from "@/features/learning/types";
import { normalizeResource } from "@/features/learning/service/query";

/*
 * Repository for the top-level `learningResources` collection. Feature code
 * never touches Firestore directly — it goes through these typed functions
 * (mirrors the assessments / roadmaps / bookmarks repositories). Each document
 * id is the resource id. Every record is normalized on read, so partial or
 * legacy documents can never crash the hub.
 */

function resourcesRef() {
  return adminDb.collection("learningResources");
}

export async function listLearningResources(): Promise<LearningResource[]> {
  const snap = await resourcesRef().get();
  return snap.docs.map((doc) =>
    normalizeResource({ ...(doc.data() as Record<string, unknown>), id: doc.id }),
  );
}

export async function getLearningResource(id: string): Promise<LearningResource | null> {
  const doc = await resourcesRef().doc(id).get();
  if (!doc.exists) return null;
  return normalizeResource({ ...(doc.data() as Record<string, unknown>), id: doc.id });
}

export async function upsertLearningResource(resource: LearningResource): Promise<void> {
  const { id, ...rest } = resource;
  await resourcesRef()
    .doc(id)
    .set({ ...rest, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function deleteLearningResource(id: string): Promise<void> {
  await resourcesRef().doc(id).delete();
}
