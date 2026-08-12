import { cache } from "react";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { RESUME_VERSION, type ResumeData, type ResumeDoc } from "@/types/resume";

// Repository for `users/{uid}/resumes`. A single primary resume is used.
const PRIMARY_ID = "primary";

function resumesRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("resumes");
}

async function getPrimaryResume__impl(uid: string): Promise<ResumeDoc | null> {
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

/** Request-memoized: dedupes identical per-user reads within a single render (I3). */
export const getPrimaryResume = cache(getPrimaryResume__impl);
