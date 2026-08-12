import type { Metadata } from "next";
import { getAnalyticsData } from "@/features/analytics/queries";
import { AnalyticsView } from "@/features/analytics/components/analytics-view";

export const metadata: Metadata = {
  title: "Career Analytics",
  description:
    "Track your career readiness, learning progress, achievements, and XP across every CareerVerse module.",
};

export default async function AnalyticsPage() {
  const data = await getAnalyticsData();
  return <AnalyticsView data={data} />;
}
