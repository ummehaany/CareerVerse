import type { Metadata } from "next";
import { getAssessmentEntry } from "@/features/assessment/queries";
import { AssessmentFlow } from "@/features/assessment/components/assessment-flow";

export const metadata: Metadata = { title: "Career Assessment" };

// Server-rendered per user: reads any resumable draft, then hands a serializable
// snapshot to the client flow. No feature logic runs here.
export default async function AssessmentPage() {
  const { draft, latestStatus } = await getAssessmentEntry();

  return <AssessmentFlow initialDraft={draft} hasCompleted={latestStatus === "completed"} />;
}
