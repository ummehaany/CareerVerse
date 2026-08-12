import type { Metadata } from "next";
import { getTimelinePageData } from "@/features/timeline/queries";
import { TimelineView } from "@/features/timeline/components/timeline-view";

export const metadata: Metadata = { title: "Career Timeline" };

export default async function TimelinePage() {
  const data = await getTimelinePageData();
  return <TimelineView data={data} />;
}
