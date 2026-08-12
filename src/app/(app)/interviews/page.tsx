import type { Metadata } from "next";
import { getInterviewPageData } from "@/features/interview/queries";
import { InterviewView } from "@/features/interview/components/interview-view";
import { getIntelligence } from "@/features/intelligence/queries";
import { actionForContext } from "@/features/intelligence/engine";
import { InsightTip } from "@/features/intelligence/components/insight-tip";

export const metadata: Metadata = { title: "Mock Interviews" };

export default async function InterviewsPage() {
  const data = await getInterviewPageData();
  const intel = await getIntelligence();
  const tip = actionForContext(intel, "interview");
  return (
    <div className="space-y-6">
      {tip && (
        <div className="mx-auto max-w-3xl">
          <InsightTip action={tip} />
        </div>
      )}
      <InterviewView data={data} />
    </div>
  );
}
