import { adminDb, FieldValue } from "@/lib/firebase/admin";

// Repository for `users/{uid}/skillProgress/{careerSlug}` — tracks which
// missing skills the user has marked as learned, per target career.

function skillProgressRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("skillProgress");
}

export async function getSkillProgress(uid: string, careerSlug: string): Promise<string[]> {
  const snap = await skillProgressRef(uid).doc(careerSlug).get();
  if (!snap.exists) return [];
  const data = snap.data() as { learned?: string[] };
  return data.learned ?? [];
}

export async function setSkillProgress(
  uid: string,
  careerSlug: string,
  learned: string[],
): Promise<void> {
  await skillProgressRef(uid)
    .doc(careerSlug)
    .set({ learned, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}
