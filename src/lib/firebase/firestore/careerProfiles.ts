import { adminDb, FieldValue } from "@/lib/firebase/admin";
import type { CareerProfile, SkillRef } from "@/types";

const COLLECTION = "careerProfiles";

/**
 * Fill in any fields missing from a stored `careerProfiles/{uid}` document
 * with their schema defaults (empty array / null), without touching
 * Firestore. Needed because `experience` (and potentially other fields) were
 * added to the `CareerProfile` shape after some documents were created, so
 * older/legacy docs can be missing keys entirely rather than having them as
 * `[]`. Every reader gets the full expected shape; the stored document itself
 * is left exactly as-is (no data is overwritten).
 */
function normalizeCareerProfile(uid: string, data: Partial<CareerProfile>): CareerProfile {
  return {
    uid,
    education: data.education ?? [],
    experience: data.experience ?? [],
    currentRole: data.currentRole ?? null,
    skills: data.skills ?? [],
    interests: data.interests ?? [],
    goals: data.goals ?? [],
    targetRoles: data.targetRoles ?? [],
    strengths: data.strengths ?? [],
    aiSummary: data.aiSummary ?? null,
    createdAt: data.createdAt as CareerProfile["createdAt"],
    updatedAt: data.updatedAt as CareerProfile["updatedAt"],
  };
}

export async function getCareerProfile(uid: string): Promise<CareerProfile | null> {
  const snap = await adminDb.collection(COLLECTION).doc(uid).get();
  if (!snap.exists) return null;
  return normalizeCareerProfile(uid, snap.data() as Partial<CareerProfile>);
}

/**
 * Idempotently create an empty `careerProfiles/{uid}` document. The profile is
 * populated later by the onboarding assessment (Phase 5).
 */
export async function ensureCareerProfile(uid: string): Promise<void> {
  const ref = adminDb.collection(COLLECTION).doc(uid);
  const snap = await ref.get();
  if (snap.exists) return;

  await ref.set({
    uid,
    education: [],
    experience: [],
    currentRole: null,
    skills: [],
    interests: [],
    goals: [],
    targetRoles: [],
    strengths: [],
    aiSummary: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
}

export interface CareerProfilePatch {
  education?: string[];
  interests?: string[];
  goals?: string[];
  targetRoles?: string[];
  strengths?: string[];
  skills?: SkillRef[];
}

/**
 * Merge directly-provided assessment fields onto the profile. AI-derived fields
 * (aiSummary, matched roles) are intentionally left untouched for a later phase.
 */
export async function applyAssessmentToProfile(uid: string, patch: CareerProfilePatch): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .set({ ...patch, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}
