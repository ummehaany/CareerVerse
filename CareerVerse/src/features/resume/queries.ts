import { verifySession } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore/users";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getPrimaryResume } from "@/lib/firebase/firestore/resumes";
import type { ResumeData } from "@/types/resume";

export interface ResumePageData {
  resume: ResumeData;
  exists: boolean;
}

function emptyResume(): ResumeData {
  return {
    template: "classic",
    contact: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };
}

/** Existing resume, or a draft prefilled from the user's profile. */
export async function getResumePageData(): Promise<ResumePageData> {
  const decoded = await verifySession();
  if (!decoded) return { resume: emptyResume(), exists: false };
  const uid = decoded.uid;

  const existing = await getPrimaryResume(uid);
  if (existing) {
    return {
      exists: true,
      resume: {
        template: existing.template ?? "classic",
        contact: existing.contact,
        summary: existing.summary ?? "",
        experience: existing.experience ?? [],
        education: existing.education ?? [],
        skills: existing.skills ?? [],
        projects: existing.projects ?? [],
        certifications: existing.certifications ?? [],
      },
    };
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
  }

  return { resume: draft, exists: false };
}
