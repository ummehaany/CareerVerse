import type { Metadata } from "next";
import { getDiscoveryEntry } from "@/features/assessment/discovery/queries";
import { DiscoveryFlow } from "@/features/assessment/discovery/components/discovery-flow";

export const metadata: Metadata = { title: "Career Discovery" };

// Career Discovery — a short, deterministic, weighted-scoring redesign of the
// old Career Assessment. 20 mandatory Core questions (a few minutes) produce
// a standalone Top 3 career match with plain-language "why", plus an
// optional 30-question Deep tier that refines that same result using the
// same scoring engine (`scoring.ts`) — never a different one.
// `?retake=1` restarts from the intro even for completed users.
export default async function CareerDiscoveryPage({
  searchParams,
}: {
  searchParams: Promise<{ retake?: string }>;
}) {
  const { retake } = await searchParams;
  const entry = await getDiscoveryEntry();

  return (
    <DiscoveryFlow
      initialCompleted={entry.completed}
      initialAdvancedCompleted={entry.advancedCompleted}
      initialRecommendations={entry.recommendations}
      initialBasicAnswers={entry.basicAnswers}
      initialAdvancedAnswers={entry.advancedAnswers}
      initialAssessmentId={entry.assessmentId}
      initialCuriosityNote={entry.curiosityNote}
      forceRetake={retake === "1"}
    />
  );
}
