import type { Portfolio } from "@/types/portfolio";

/**
 * Aggregated, read-only progress signals surfaced in the portfolio's
 * "Progress Overview". Every value is 0–100 (or null when there's no data yet)
 * so the UI can render meters uniformly.
 */
export interface ProgressOverview {
  resumeCompletion: number;
  roadmapCompletion: number;
  interviewPerformance: number | null;
  interviewCount: number;
  skillReadiness: number | null;
  careerReadiness: number;
}

/** Everything the /portfolio page needs, fully serializable for the client. */
export interface PortfolioPageData {
  portfolio: Portfolio;
  progress: ProgressOverview;
  /** True when the user has never saved a portfolio (content is seeded). */
  isNew: boolean;
  displayName: string;
  email: string;
}
