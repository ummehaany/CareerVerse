import type { Metadata } from "next";
import { getRecommendationsPageData } from "@/features/recommendations/queries";
import { RecommendationsView } from "@/features/recommendations/components/recommendations-view";
import { getIntelligence } from "@/features/intelligence/queries";
import { actionForContext } from "@/features/intelligence/engine";
import { InsightTip } from "@/features/intelligence/components/insight-tip";

export const metadata: Metadata = { title: "Career Matches" };

export default async function RecommendationsPage() {
  const data = await getRecommendationsPageData();
  const intel = await getIntelligence();
  const tip = actionForContext(intel, "recommendations");
  return (
    <div className="space-y-6">
      {tip && (
        <div className="mx-auto max-w-3xl">
          <InsightTip action={tip} />
        </div>
      )}
      <RecommendationsView data={data} />
    </div>
  );
}
