import { getCareers } from "@/lib/careers/catalog";
import { verifySession } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import type { Career } from "@/lib/careers/types";

export interface ComparePageData {
  careers: Career[];
  userSkills: string[];
}

export async function getComparePageData(): Promise<ComparePageData> {
  const decoded = await verifySession();
  let userSkills: string[] = [];
  if (decoded) {
    const assessment = await getLatestAssessment(decoded.uid);
    if (assessment?.structured) {
      userSkills = [
        ...assessment.structured.technicalSkills,
        ...assessment.structured.softSkills,
        ...assessment.structured.interests,
      ];
    }
  }
  return { careers: getCareers(), userSkills };
}
