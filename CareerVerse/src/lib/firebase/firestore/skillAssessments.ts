import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { SKILL_ASSESSMENT_VERSION, type SavedSkill, type SkillAssessmentDoc } from "@/types/skill-assessment";

// Repository for `users/{uid}/skillAssessments`.

function ref(uid: string) {
  return adminDb.collection("users").doc(uid).collection("skillAssessments");
}

export interface SaveSkillAssessmentInput {
  careerSlug: string;
  careerTitle: string;
  skills: SavedSkill[];
  readinessScore: number;
  masteredCount: number;
  partialCount: number;
  missingCount: number;
  totalRequired: number;
}

export async function saveSkillAssessment(uid: string, input: SaveSkillAssessmentInput): Promise<{ id: string }> {
  const doc = ref(uid).doc();
  await doc.set({
    ...input,
    schemaVersion: SKILL_ASSESSMENT_VERSION,
    createdAt: FieldValue.serverTimestamp(),
  });
  return { id: doc.id };
}

export async function listSkillAssessments(uid: string, max = 10): Promise<SkillAssessmentDoc[]> {
  const snap = await ref(uid).orderBy("createdAt", "desc").limit(max).get();
  return snap.docs.map((d) => ({ ...(d.data() as SkillAssessmentDoc), id: d.id }));
}
