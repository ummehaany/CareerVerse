import type { FirestoreTimestamp } from "./user";

/** Bump when the roadmap shape changes. */
export const ROADMAP_VERSION = 1;

export type StageLevel = "beginner" | "intermediate" | "advanced";
export type MilestoneStatus = "not_started" | "in_progress" | "completed";

export interface RoadmapProject {
  title: string;
  description: string;
}

export interface Milestone {
  /** Stable id used for progress tracking. */
  id: string;
  title: string;
  description: string;
  skills: string[];
  /** Human-readable estimate, e.g. "2–3 weeks". */
  estimatedTime: string;
  projects: RoadmapProject[];
  certifications: string[];
  resources: string[];
}

export interface RoadmapStage {
  level: StageLevel;
  title: string;
  summary: string;
  estimatedTime: string;
  milestones: Milestone[];
}

/** `users/{uid}/roadmaps/{id}` — one generated learning roadmap. */
export interface RoadmapDoc {
  id: string;
  /** The target career this roadmap leads to. */
  careerTitle: string;
  assessmentId: string | null;
  provider: string;
  model: string;
  schemaVersion: number;
  overview: string;
  totalEstimatedTime: string;
  stages: RoadmapStage[];
  /** milestoneId → status. Absent keys are treated as not_started. */
  progress: Record<string, MilestoneStatus>;
  createdAt: FirestoreTimestamp | null;
  updatedAt: FirestoreTimestamp | null;
}
