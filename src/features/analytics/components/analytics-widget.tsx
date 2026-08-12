import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ArrowRightIcon, TrendingUpIcon, SparklesIcon, FlagIcon } from "@/components/ui/icon";
import { AwardIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import { LineChart } from "./line-chart";
import type { AnalyticsWidgetData } from "../types";

/** Compact Career Analytics widget for the dashboard. */
export function AnalyticsWidget({ data }: { data: AnalyticsWidgetData }) {
  const pct = data.xpForLevel > 0 ? Math.round((data.xpIntoLevel / data.xpForLevel) * 100) : 0;

  return (
    <Card
      className="relative space-y-4 overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--accent-mentor) 12%, var(--background)) 0%, var(--background) 62%)",
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[var(--accent-mentor)] text-white text-sm font-bold">
            {data.level}
          </span>
          <div>
            <h3 className="text-sm font-semibold tracking-tight">Level {data.level} · {data.levelTitle}</h3>
            <p className="text-xs text-subtle tabular-nums">{data.xpIntoLevel}/{data.xpForLevel} XP · {pct}%</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary tabular-nums">
          <TrendingUpIcon size={12} /> {data.streak}d streak
        </span>
      </div>

      <div className="rounded-lg border border-border bg-background/60 p-2 backdrop-blur-sm">
        <LineChart points={data.readinessTrend} height={110} color="var(--primary)" suffix="%" ariaLabel="Readiness trend" />
      </div>

      <div className="grid gap-2 text-sm">
        <p className="flex items-start gap-2">
          <AwardIcon size={15} className="mt-0.5 shrink-0 text-[var(--accent-mentor)]" />
          <span><span className="text-subtle">Recent: </span>{data.recentAchievement ?? "No achievements yet"}</span>
        </p>
        <p className="flex items-start gap-2">
          <FlagIcon size={15} className="mt-0.5 shrink-0 text-primary" />
          <span><span className="text-subtle">Goal: </span>{data.weeklyGoal}</span>
        </p>
        <p className="flex items-start gap-2 text-muted">
          <SparklesIcon size={15} className="mt-0.5 shrink-0 text-[var(--accent-resume)]" />
          <span className="italic">{data.dailyMotivation}</span>
        </p>
      </div>

      <Link
        href={ROUTES.analytics}
        className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        View analytics
        <ArrowRightIcon size={16} />
      </Link>
    </Card>
  );
}
