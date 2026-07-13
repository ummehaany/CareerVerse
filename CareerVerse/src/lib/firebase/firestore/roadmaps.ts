import { adminDb, FieldValue } from "@/lib/firebase/admin";
import {
  ROADMAP_VERSION,
  type MilestoneStatus,
  type RoadmapDoc,
  type RoadmapStage,
} from "@/types/roadmap";

// Repository for `users/{uid}/roadmaps`.

function roadmapsRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("roadmaps");
}

/** The most recently touched roadmap for a user, or null. */
export async function getLatestRoadmap(uid: string): Promise<RoadmapDoc | null> {
  const snap = await roadmapsRef(uid).orderBy("updatedAt", "desc").limit(1).get();
  if (snap.empty) return null;
  const doc = snap.docs[0]!;
  return { ...(doc.data() as RoadmapDoc), id: doc.id };
}

export async function getRoadmap(uid: string, id: string): Promise<RoadmapDoc | null> {
  const snap = await roadmapsRef(uid).doc(id).get();
  return snap.exists ? { ...(snap.data() as RoadmapDoc), id: snap.id } : null;
}

export interface SaveRoadmapInput {
  careerTitle: string;
  assessmentId: string | null;
  provider: string;
  model: string;
  overview: string;
  totalEstimatedTime: string;
  stages: RoadmapStage[];
}

/** Persist a freshly generated roadmap with empty progress. */
export async function saveRoadmap(uid: string, input: SaveRoadmapInput): Promise<{ id: string }> {
  const ref = roadmapsRef(uid).doc();
  await ref.set({
    careerTitle: input.careerTitle,
    assessmentId: input.assessmentId,
    provider: input.provider,
    model: input.model,
    schemaVersion: ROADMAP_VERSION,
    overview: input.overview,
    totalEstimatedTime: input.totalEstimatedTime,
    stages: input.stages,
    progress: {},
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  return { id: ref.id };
}

/** Update a single milestone's status (progress tracking). */
export async function setMilestoneStatus(
  uid: string,
  roadmapId: string,
  milestoneId: string,
  status: MilestoneStatus,
): Promise<void> {
  await roadmapsRef(uid)
    .doc(roadmapId)
    .set(
      {
        progress: { [milestoneId]: status },
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}
