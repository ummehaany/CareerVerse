import type { Metadata } from "next";
import { getResumePageData } from "@/features/resume/queries";
import { ResumeBuilder } from "@/features/resume/components/resume-builder";
import { getIntelligence } from "@/features/intelligence/queries";
import { actionForContext } from "@/features/intelligence/engine";
import { InsightTip } from "@/features/intelligence/components/insight-tip";

export const metadata: Metadata = { title: "Resume Builder" };

export default async function ResumePage() {
  const data = await getResumePageData();
  const intel = await getIntelligence();
  const tip = actionForContext(intel, "resume");
  return (
    <div className="space-y-6">
      {tip && (
        <div className="mx-auto max-w-6xl">
          <InsightTip action={tip} />
        </div>
      )}
      <ResumeBuilder data={data} />
    </div>
  );
}
