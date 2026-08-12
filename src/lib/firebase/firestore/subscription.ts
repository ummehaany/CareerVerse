import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { getUser } from "@/lib/firebase/firestore/users";
import { FREE_LIMITS, METERED_FEATURES, type MeteredFeature, type Plan, type PlanStatus } from "@/features/subscription/config";
import type { ConsumeResult, MonthlyUsage, SubscriptionSnapshot } from "@/features/subscription/types";
import { notifyProActivated } from "@/lib/email/triggers";

const COLLECTION = "users";

/** UTC "YYYY-MM" period key the counters belong to. */
function currentPeriod(): string {
  return new Date().toISOString().slice(0, 7);
}

/** ISO date for the first day of next month (UTC) — when the free allowance resets. */
function nextResetISO(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1)).toISOString();
}

function emptyUsage(period: string): MonthlyUsage {
  return { period, careerPlanning: 0, resumeAI: 0, mockInterview: 0, careerInsights: 0 };
}

/** Normalize any stored usage to the current period (stale periods read as zero). */
function usageForPeriod(stored: MonthlyUsage | undefined, period: string): MonthlyUsage {
  if (!stored || stored.period !== period) return emptyUsage(period);
  return {
    period,
    careerPlanning: stored.careerPlanning ?? 0,
    resumeAI: stored.resumeAI ?? 0,
    mockInterview: stored.mockInterview ?? 0,
    careerInsights: stored.careerInsights ?? 0,
  };
}

/**
 * Atomically consume one unit of a metered feature.
 * Pro → always allowed, no counting. Free → enforces the monthly limit with an
 * automatic period reset. Returns whether it was allowed plus usage details.
 */
export async function consumeFeature(uid: string, feature: MeteredFeature): Promise<ConsumeResult> {
  const ref = adminDb.collection(COLLECTION).doc(uid);
  const period = currentPeriod();

  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.exists ? snap.data() : undefined;
      const plan: Plan = (data?.plan as Plan) ?? "free";

      if (plan === "pro") {
        return { allowed: true, feature, used: 0, limit: null, remaining: null };
      }

      const usage = usageForPeriod(data?.monthlyUsage as MonthlyUsage | undefined, period);
      const limit = FREE_LIMITS[feature];
      const used = usage[feature];

      if (used >= limit) {
        return { allowed: false, feature, used, limit, remaining: 0 };
      }

      usage[feature] = used + 1;
      tx.set(
        ref,
        { monthlyUsage: usage, usageResetDate: nextResetISO(), updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );
      return { allowed: true, feature, used: used + 1, limit, remaining: limit - (used + 1) };
    });
  } catch {
    // Fail open — never hard-block a legitimate user on infra errors.
    return { allowed: true, feature, used: 0, limit: null, remaining: null };
  }
}

/** Read-only subscription view for rendering (no writes; safe in server components). */
export async function getSubscriptionSnapshot(uid: string): Promise<SubscriptionSnapshot> {
  const user = await getUser(uid);
  const plan: Plan = (user?.plan as Plan) ?? "free";
  const planStatus: PlanStatus = (user?.planStatus as PlanStatus) ?? (plan === "pro" ? "active" : "none");
  const isPro = plan === "pro";
  const period = currentPeriod();
  const usage = usageForPeriod(user?.monthlyUsage, period);

  const used = {} as Record<MeteredFeature, number>;
  const limits = {} as Record<MeteredFeature, number | null>;
  const remaining = {} as Record<MeteredFeature, number | null>;
  for (const f of METERED_FEATURES) {
    used[f] = usage[f];
    limits[f] = isPro ? null : FREE_LIMITS[f];
    remaining[f] = isPro ? null : Math.max(0, FREE_LIMITS[f] - usage[f]);
  }

  return { plan, planStatus, isPro, usage: used, limits, remaining, resetDate: nextResetISO() };
}

/**
 * Set a user's plan. This is the single integration point a payment provider
 * (Razorpay/Stripe) calls on a successful charge / webhook — no other business
 * logic changes when payments are added.
 */
export async function setPlan(uid: string, plan: Plan, status: PlanStatus = plan === "pro" ? "active" : "none"): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .set({ plan, planStatus: status, updatedAt: FieldValue.serverTimestamp() }, { merge: true });

  // Celebrate the upgrade (fire-and-forget; deduped/anti-spammed downstream).
  if (plan === "pro" && status === "active") void notifyProActivated(uid);
}
