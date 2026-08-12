import type { MeteredFeature, Plan, PlanStatus } from "./config";

/** Per-feature monthly counters stored on the user document. */
export interface MonthlyUsage {
  /** Period key "YYYY-MM" (UTC) the counters belong to. */
  period: string;
  careerPlanning: number;
  resumeAI: number;
  mockInterview: number;
  careerInsights: number;
}

/** Serializable subscription view for client components. */
export interface SubscriptionSnapshot {
  plan: Plan;
  planStatus: PlanStatus;
  isPro: boolean;
  usage: Record<MeteredFeature, number>;
  /** Resolved limit per feature; null means unlimited (Pro). */
  limits: Record<MeteredFeature, number | null>;
  /** Remaining this month; null means unlimited. */
  remaining: Record<MeteredFeature, number | null>;
  /** ISO date the free allowance resets (first of next month, UTC). */
  resetDate: string;
}

/** Result of attempting to consume one unit of a metered feature. */
export interface ConsumeResult {
  allowed: boolean;
  feature: MeteredFeature;
  used: number;
  limit: number | null;
  remaining: number | null;
}
