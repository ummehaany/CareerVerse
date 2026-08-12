import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRightIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { PlanBadge } from "./plan-badge";
import { UsageMeters } from "./usage-meters";
import type { SubscriptionSnapshot } from "../types";

/** Dashboard card: current plan + remaining monthly AI usage (+ honest Pro-coming-soon link on Free). */
export function PlanUsageCard({ snapshot }: { snapshot: SubscriptionSnapshot }) {
  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold tracking-tight">Your plan</h2>
        <PlanBadge isPro={snapshot.isPro} />
      </div>
      <UsageMeters snapshot={snapshot} />
      {!snapshot.isPro && (
        <Link
          href={ROUTES.pricing}
          className="inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-md border border-foreground/15 px-4 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
        >
          Pro coming soon <ArrowRightIcon size={15} />
        </Link>
      )}
    </Card>
  );
}
