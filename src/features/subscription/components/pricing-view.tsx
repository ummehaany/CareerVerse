import { PageHeader } from "@/components/shared/page-header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SparklesIcon, CheckIcon, XIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { PLAN_COMPARISON, PRO_BENEFITS, PRO_PRICE, type PlanFeatureRow } from "../config";

function Cell({ value }: { value: string | boolean }) {
  if (value === true) return <CheckIcon size={16} className="mx-auto text-success" aria-label="Included" />;
  if (value === false) return <XIcon size={15} className="mx-auto text-subtle" aria-label="Not included" />;
  return <span className="text-xs text-muted">{value}</span>;
}

export function PricingView({ isPro }: { isPro: boolean }) {
  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-up">
      <PageHeader
        title="Pricing"
        description="Simple, student-friendly pricing. Start free — upgrade only when you're ready."
      />

      {/* Plan cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Free */}
        <Card className="flex flex-col gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight">CareerVerse Free</span>
              {!isPro && <Badge variant="muted">Current plan</Badge>}
            </div>
            <p className="mt-1 text-3xl font-bold tracking-tight">₹0<span className="text-sm font-normal text-muted">/forever</span></p>
          </div>
          <ul className="space-y-2 text-sm">
            {["Career Discovery & Dashboard", "Career & Companies Explorer", "Basic Resume Builder", "Basic Roadmap & Analytics", "3 AI Career Plans / month", "3 Resume AI / month", "2 Mock Interviews / month", "5 AI Career Insights / month"].map((f) => (
              <li key={f} className="flex items-start gap-2 text-muted">
                <CheckIcon size={16} className="mt-0.5 shrink-0 text-success" /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-2">
            <Button variant="outline" disabled className="w-full">
              {isPro ? "Included with Pro" : "Your current plan"}
            </Button>
          </div>
        </Card>

        {/* Pro */}
        <Card className="relative flex flex-col gap-4 border-primary/40 ring-1 ring-primary/20">
          <span className="absolute -top-3 left-5 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            <SparklesIcon size={12} /> {isPro ? "Most popular" : "Coming soon"}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold tracking-tight">CareerVerse Pro</span>
              {isPro && <Badge variant="primary">Current plan</Badge>}
            </div>
            <p className="mt-1 text-3xl font-bold tracking-tight">
              {PRO_PRICE.display}<span className="text-sm font-normal text-muted">/{PRO_PRICE.period}</span>
            </p>
            <p className="text-xs text-subtle">
              {isPro ? "Student plan · cancel anytime" : "Planned pricing — not available for purchase yet"}
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            {PRO_BENEFITS.map((f) => (
              <li key={f} className="flex items-start gap-2 text-muted">
                <CheckIcon size={16} className="mt-0.5 shrink-0 text-primary" /> {f}
              </li>
            ))}
          </ul>
          <div className="mt-auto pt-2">
            {isPro ? (
              <Button disabled className="w-full">You&apos;re on Pro 🎉</Button>
            ) : (
              <div
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-center text-sm text-muted"
                role="status"
              >
                <span className="font-medium text-foreground">Pro is coming soon.</span> Payments aren&apos;t
                available yet — your Free plan keeps working as normal in the meantime.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Comparison table */}
      <Card className="space-y-4">
        <h2 className="font-semibold tracking-tight">Compare plans</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="py-2 pr-4 font-medium text-muted">Feature</th>
                <th className="px-3 py-2 text-center font-medium">Free</th>
                <th className="px-3 py-2 text-center font-medium text-primary">Pro</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_COMPARISON.map((row: PlanFeatureRow) => (
                <tr key={row.label} className="border-b border-border/60">
                  <td className="py-2.5 pr-4 text-muted">{row.label}</td>
                  <td className="px-3 py-2.5 text-center"><Cell value={row.free} /></td>
                  <td className={cn("px-3 py-2.5 text-center")}><Cell value={row.pro} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-subtle">
          Built for students. The Free plan stays generous — Pro simply removes the monthly limits and unlocks premium tools.
        </p>
      </Card>
    </div>
  );
}
