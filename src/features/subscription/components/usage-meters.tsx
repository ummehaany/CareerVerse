import { Progress } from "@/components/ui/progress";
import { METERED_FEATURES, FEATURE_LABELS } from "../config";
import type { SubscriptionSnapshot } from "../types";

/** Remaining monthly AI usage per metered feature (Unlimited on Pro). */
export function UsageMeters({ snapshot }: { snapshot: SubscriptionSnapshot }) {
  return (
    <div className="space-y-3">
      {METERED_FEATURES.map((f) => {
        const limit = snapshot.limits[f];
        const used = snapshot.usage[f];
        const remaining = snapshot.remaining[f];
        const unlimited = limit === null;
        const pct = unlimited || !limit ? 100 : Math.min(100, Math.round((used / limit) * 100));
        return (
          <div key={f} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium">{FEATURE_LABELS[f]}</span>
              <span className="tabular-nums text-muted">
                {unlimited ? "Unlimited" : `${remaining} / ${limit} remaining`}
              </span>
            </div>
            {!unlimited && <Progress value={pct} />}
          </div>
        );
      })}
    </div>
  );
}
