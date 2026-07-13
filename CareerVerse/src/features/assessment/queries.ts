import { verifySession } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import type { AssessmentStatus } from "@/types/assessment";
import type { AssessmentDraftView } from "./types";

export interface AssessmentEntry {
  /** A resumable in-progress draft, if one exists. */
  draft: AssessmentDraftView | null;
  /** Status of the most recent attempt (drives the intro copy). */
  latestStatus: AssessmentStatus | null;
}

/**
 * Server-side read used by the assessment page. Returns a serializable draft
 * (no Firestore Timestamps) plus the latest attempt status.
 */
export async function getAssessmentEntry(): Promise<AssessmentEntry> {
  const decoded = await verifySession();
  if (!decoded) return { draft: null, latestStatus: null };

  const latest = await getLatestAssessment(decoded.uid);
  if (!latest) return { draft: null, latestStatus: null };

  const draft: AssessmentDraftView | null =
    latest.status === "in_progress"
      ? {
          id: latest.id,
          status: latest.status,
          currentStep: latest.currentStep ?? 0,
          answers: latest.answers ?? {},
        }
      : null;

  return { draft, latestStatus: latest.status };
}
