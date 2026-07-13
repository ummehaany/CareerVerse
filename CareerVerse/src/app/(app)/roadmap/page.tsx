import type { Metadata } from "next";
import { getRoadmapPageData } from "@/features/roadmap/queries";
import { RoadmapView } from "@/features/roadmap/components/roadmap-view";

export const metadata: Metadata = { title: "Learning Roadmap" };

export default async function RoadmapPage() {
  const data = await getRoadmapPageData();
  return <RoadmapView data={data} />;
}
