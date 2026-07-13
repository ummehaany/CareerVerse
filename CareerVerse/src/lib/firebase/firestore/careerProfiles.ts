import { adminDb, FieldValue } from "@/lib/firebase/admin";
import type { CareerProfile, SkillRef } from "@/types";

const COLLECTION = "careerProfiles";

export async function getCareerProfile(uid: string): Promise<CareerProfile | null> {
  const snap = await adminDb.collection(COLLECTION).doc(uid).get();
  return snap.exists ? (snap.data() as CareerProfile) : null;
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
