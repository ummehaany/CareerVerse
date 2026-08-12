import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SparklesIcon, ArrowRightIcon, FlagIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import type { CoachWidgetData } from "../types";

/** Compact AI Coach widget for the dashboard. */
export function CoachWidget({ data }: { data: CoachWidgetData }) {
  return (
    <Card
      className="relative space-y-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--primary) 14%, var(--background)) 0%, var(--background) 62%)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[var(--accent-mentor)] text-white">
            <SparklesIcon size={18} />
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight">AI Career Coach</h3>
            <p className="text-xs text-subtle">Daily guidance across your journey</p>
          </div>
        </div>
        <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary tabular-nums">
          {data.careerReadiness}% ready
        </span>
      </div>

      <p className="text-sm text-foreground/85">{data.dailyAdvice}</p>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-background/70 p-3 backdrop-blur-sm">
        <FlagIcon size={15} className="mt-0.5 shrink-0 text-primary" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Today&apos;s priority</p>
          <p className="text-sm font-medium">{data.todaysPriority}</p>
        </div>
      </div>

      {data.progress.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {data.progress.map((p) => (
            <div key={p.label} className="space-y-1">
              <div className="flex justify-between text-[11px] text-muted">
                <span>{p.label}</span>
                <span className="tabular-nums">{p.value}%</span>
              </div>
              <Progress value={p.value} />
            </div>
          ))}
        </div>
      )}

      <Link
        href={ROUTES.coach}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        Ask AI Coach
        <ArrowRightIcon size={16} />
      </Link>
    </Card>
  );
}
