import Link from "next/link";
import { Card } from "@/components/ui/card";
import { SparklesIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { PlanBadge } from "./plan-badge";
import { UsageMeters } from "./usage-meters";
import type { SubscriptionSnapshot } from "../types";

/** Settings → Subscription: plan, usage, upgrade, and a future-billing placeholder. */
export function SubscriptionSettings({ snapshot }: { snapshot: SubscriptionSnapshot }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <SparklesIcon size={16} />
          </span>
          <div>
            <h2 className="font-semibold tracking-tight">Subscription</h2>
            <p className="text-sm text-muted">Your plan and monthly AI usage.</p>
          </div>
        </div>
        <PlanBadge isPro={snapshot.isPro} />
      </div>

      <div className="border-t border-border pt-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">This month&apos;s usage</p>
        <UsageMeters snapshot={snapshot} />
      </div>

      {!snapshot.isPro && (
        <Link
          href={ROUTES.pricing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-foreground/15 px-4 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          <SparklesIcon size={16} /> Pro coming soon — see plans
        </Link>
      )}

      <p className="border-t border-border pt-4 text-xs text-subtle">
        Pro isn&apos;t available to purchase yet. Billing &amp; invoices will appear here once payments launch —
        your Free-plan usage and limits keep working as normal until then.
      </p>
    </Card>
  );
}
