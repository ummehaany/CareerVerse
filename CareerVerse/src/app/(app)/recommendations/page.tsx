import type { Metadata } from "next";
import { getRecommendationsPageData } from "@/features/recommendations/queries";
import { RecommendationsView } from "@/features/recommendations/components/recommendations-view";

export const metadata: Metadata = { title: "Career Matches" };

export default async function RecommendationsPage() {
  const data = await getRecommendationsPageData();
  return <RecommendationsView data={data} />;
}
