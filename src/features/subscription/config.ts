/*
 * Subscription domain — plans, pricing, metered features, and limits.
 *
 * Pure, provider-agnostic configuration. Business logic (usage tracking, gating)
 * and UI import from here; a future payment provider (Razorpay/Stripe) plugs in
 * without touching any of this.
 */

export type Plan = "free" | "pro";
export type PlanStatus = "none" | "active" | "canceled" | "past_due";

/** AI features that are metered on the Free plan. */
export type MeteredFeature = "careerPlanning" | "resumeAI" | "mockInterview" | "careerInsights";

export const METERED_FEATURES: MeteredFeature[] = [
  "careerPlanning",
  "resumeAI",
  "mockInterview",
  "careerInsights",
];

export const FEATURE_LABELS: Record<MeteredFeature, string> = {
  careerPlanning: "AI Career Planning",
  resumeAI: "Resume AI",
  mockInterview: "Mock Interviews",
  careerInsights: "AI Career Insights",
};

/** Free-plan monthly allowance per metered feature. Pro is unlimited. */
export const FREE_LIMITS: Record<MeteredFeature, number> = {
  careerPlanning: 3,
  resumeAI: 3,
  mockInterview: 2,
  careerInsights: 5,
};

/** Pricing (single source of truth; a payment provider reads amount/currency). */
export const PRO_PRICE = {
  amount: 99,
  currency: "INR",
  display: "₹99",
  period: "month",
} as const;

/** Resolved limit for a plan+feature. Pro → Infinity (unlimited). */
export function limitFor(plan: Plan, feature: MeteredFeature): number {
  return plan === "pro" ? Infinity : FREE_LIMITS[feature];
}

export function isUnlimited(plan: Plan): boolean {
  return plan === "pro";
}

/** Feature-comparison rows for the pricing page. `free` may be a string or bool. */
export interface PlanFeatureRow {
  label: string;
  free: string | boolean;
  pro: string | boolean;
}

export const PLAN_COMPARISON: PlanFeatureRow[] = [
  { label: "Career Discovery", free: true, pro: true },
  { label: "Dashboard & Career Explorer", free: true, pro: true },
  { label: "Companies Explorer", free: true, pro: true },
  { label: "Resume Builder", free: "Basic", pro: "Advanced" },
  { label: "Learning Roadmap", free: "Basic", pro: "Premium roadmaps" },
  { label: "Analytics", free: "Basic", pro: "Advanced" },
  { label: "AI Career Planning", free: "3 / month", pro: "Unlimited" },
  { label: "Resume AI optimization", free: "3 / month", pro: "Unlimited" },
  { label: "Mock Interviews", free: "2 / month", pro: "Unlimited" },
  { label: "AI Career Insights", free: "5 / month", pro: "Unlimited" },
  { label: "Company Readiness Score", free: false, pro: true },
  { label: "Priority AI processing", free: false, pro: true },
  { label: "Early access to new features", free: false, pro: true },
];

/** Benefit bullets shown in the upgrade dialog and pricing hero. */
export const PRO_BENEFITS: string[] = [
  "Unlimited AI Career Planning",
  "Unlimited Resume AI optimization",
  "Unlimited Mock Interviews",
  "Unlimited AI Career Insights",
  "Advanced analytics & Company Readiness Score",
  "Premium roadmap generation",
  "Priority AI processing & early access",
];
