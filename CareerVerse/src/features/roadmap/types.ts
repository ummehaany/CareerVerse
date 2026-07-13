import type { MilestoneStatus, RoadmapStage } from "@/types/roadmap";

/** Serializable roadmap handed from the server component to the client view. */
export interface RoadmapView {
  id: string;
  careerTitle: string;
  overview: string;
  totalEstimatedTime: string;
  stages: RoadmapStage[];
  progress: Record<string, MilestoneStatus>;
}

/** A career the user can build a roadmap toward (from their recommendations). */
export interface CareerOption {
  title: string;
  matchPercentage: number;
}
