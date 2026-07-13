import type { Metadata } from "next";
import { getComparePageData } from "@/features/compare/queries";
import { CompareView } from "@/features/compare/components/compare-view";

export const metadata: Metadata = { title: "Compare Careers" };

export default async function ComparePage() {
  const data = await getComparePageData();
  return <CompareView data={data} />;
}
