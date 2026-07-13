import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { RESUME_VERSION, type ResumeData, type ResumeDoc } from "@/types/resume";

// Repository for `users/{uid}/resumes`. A single primary resume is used.
const PRIMARY_ID = "primary";

function resumesRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("resumes");
}

export async function getPrimaryResume(uid: string): Promise<ResumeDoc | null> {
  const snap = await resumesRef(uid).doc(PRIMARY_ID).get();
  return snap.exists ? { ...(snap.data() as ResumeDoc), id: snap.id } : null;
}

/** Upsert the primary resume (merge), refreshing updatedAt each save. */
export async function savePrimaryResume(uid: string, data: ResumeData): Promise<void> {
  await resumesRef(uid)
    .doc(PRIMARY_ID)
    .set(
      {
        ...data,
        schemaVersion: RESUME_VERSION,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}
