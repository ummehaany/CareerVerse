import { adminDb, FieldValue } from "@/lib/firebase/admin";
import type { CoachMessageDoc, CoachRole } from "@/types/coach";

// Repository for `users/{uid}/coachMessages`.

function coachRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("coachMessages");
}

/** Recent messages in chronological (oldest→newest) order. */
export async function listCoachMessages(uid: string, max = 40): Promise<CoachMessageDoc[]> {
  const snap = await coachRef(uid).orderBy("createdAt", "desc").limit(max).get();
  const docs = snap.docs.map((doc) => ({ ...(doc.data() as CoachMessageDoc), id: doc.id }));
  return docs.reverse();
}

export async function appendCoachMessage(
  uid: string,
  role: CoachRole,
  content: string,
): Promise<void> {
  await coachRef(uid).add({ role, content, createdAt: FieldValue.serverTimestamp() });
}
