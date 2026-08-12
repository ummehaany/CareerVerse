import type { Metadata } from "next";
import { getRoadmapPageData } from "@/features/roadmap/queries";
import { RoadmapView } from "@/features/roadmap/components/roadmap-view";
import { getIntelligence } from "@/features/intelligence/queries";
import { actionForContext } from "@/features/intelligence/engine";
import { InsightTip } from "@/features/intelligence/components/insight-tip";

export const metadata: Metadata = { title: "Learning Roadmap" };

export default async function RoadmapPage() {
  const data = await getRoadmapPageData();
  const intel = await getIntelligence();
  const tip = actionForContext(intel, "roadmap");
  return (
    <div className="space-y-6">
      {tip && (
        <div className="mx-auto max-w-3xl">
          <InsightTip action={tip} />
        </div>
      )}
      <RoadmapView data={data} />
    </div>
  );
}
