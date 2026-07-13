import { notFound } from "next/navigation";
import { getRoadmapDetails } from "@/features/roadmap/queries";
import { RoadmapDetailView } from "@/features/roadmap/components/roadmap-detail-view";

interface PageProps {
  params: Promise<{ roadmapId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { roadmapId } = await params;
  const roadmap = await getRoadmapDetails(roadmapId);
  return {
    title: roadmap ? `${roadmap.targetCareer} Roadmap` : "Roadmap Not Found",
  };
}

export default async function RoadmapDetailPage({ params }: PageProps) {
  const { roadmapId } = await params;
  const roadmap = await getRoadmapDetails(roadmapId);

  if (!roadmap) {
    notFound();
  }

  return <RoadmapDetailView roadmap={roadmap} />;
}
