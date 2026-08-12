import { verifySession } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore/users";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getPrimaryResume } from "@/lib/firebase/firestore/resumes";
import type { ResumeData } from "@/types/resume";
import { emptyResume, normalizeResume } from "./defaults";

export interface ResumePageData {
  resume: ResumeData;
  exists: boolean;
  aiConfigured: boolean;
}

/** Existing resume (normalized), or a draft prefilled from the user's profile. */
export async function getResumePageData(): Promise<ResumePageData> {
  const { isAIConfigured } = await import("@/lib/ai");
  const aiConfigured = isAIConfigured();

  const decoded = await verifySession();
  if (!decoded) return { resume: emptyResume(), exists: false, aiConfigured };
  const uid = decoded.uid;

  const existing = await getPrimaryResume(uid);
  if (existing) {
    return { exists: true, aiConfigured, resume: normalizeResume(existing) };
  }

  const [user, assessment] = await Promise.all([getUser(uid), getLatestAssessment(uid)]);
  const draft = emptyResume();
  draft.contact.fullName = user?.displayName ?? "";
  draft.contact.email = user?.email ?? "";

  if (assessment?.structured) {
    const seen = new Set<string>();
    for (const skill of [
      ...assessment.structured.technicalSkills,
      ...assessment.structured.softSkills,
    ]) {
      const key = skill.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        draft.skills.push(skill);
      }
    }
    if (assessment.structured.interests?.length) {
      draft.interests = assessment.structured.interests.slice(0, 6);
    }
  }

  return { resume: draft, exists: false, aiConfigured };
}
