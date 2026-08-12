import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon, RouteIcon, FileTextIcon, RocketIcon, SparklesIcon, CompassIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { INTEL_ICONS } from "./icons";
import type { IntelligenceData } from "../types";

function ReadinessRing({ value }: { value: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const dash = (Math.min(100, Math.max(0, value)) / 100) * c;
  return (
    <div className="relative grid h-24 w-24 shrink-0 place-items-center">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={r} fill="none" stroke="color-mix(in srgb, var(--foreground) 12%, transparent)" strokeWidth="8" />
        <circle
          cx="48"
          cy="48"
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      <div className="absolute text-center">
        <span className="block text-xl font-bold tabular-nums leading-none">{value}%</span>
        <span className="block text-[10px] font-medium text-subtle">ready</span>
      </div>
    </div>
  );
}

function InsightTile({
  icon,
  accentVar,
  label,
  children,
  href,
}: {
  icon: ReactNode;
  accentVar: string;
  label: string;
  children: ReactNode;
  href: string;
}) {
  const accent = `var(${accentVar})`;
  return (
    <Link
      href={href}
      className="group flex flex-col gap-1.5 rounded-xl border border-border bg-background/70 p-3.5 backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-sm"
    >
      <span className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">
        <span className="grid h-5 w-5 place-items-center rounded" style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }}>
          {icon}
        </span>
        {label}
      </span>
      <span className="text-sm font-medium leading-snug">{children}</span>
    </Link>
  );
}

/** The dashboard "brain": answers readiness, priority, milestone, resume, target, insight, weekly. */
export function IntelHero({ data }: { data: IntelligenceData }) {
  const { priorityTask, nextMilestone, target } = data;
  const PriorityIcon = priorityTask ? INTEL_ICONS[priorityTask.icon] ?? SparklesIcon : SparklesIcon;

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/[0.08] via-background to-background p-5 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        {/* Readiness + summary */}
        <div className="flex items-center gap-4">
          <ReadinessRing value={data.readiness} />
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Career readiness</p>
            <p className="text-lg font-bold tracking-tight">
              {data.readiness >= 70 ? "Strong momentum" : data.readiness >= 40 ? "Steady progress" : "Getting started"}
            </p>
            <p className="mt-0.5 max-w-md text-xs text-muted">{data.weeklySummary}</p>
          </div>
        </div>

        {/* Today's priority */}
        {priorityTask && (
          <div className="w-full max-w-md rounded-2xl border border-primary/25 bg-primary/[0.06] p-4">
            <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <PriorityIcon size={13} /> Today&apos;s priority
            </p>
            <p className="mt-1 text-sm font-medium">{priorityTask.title}</p>
            <Link
              href={priorityTask.href}
              className="mt-3 inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              {priorityTask.cta}
              <ArrowRightIcon size={15} />
            </Link>
          </div>
        )}
      </div>

      {/* Insight tiles — before Career Discovery, swap out the two tiles that
          promote a direction-dependent module (roadmap, target company) for
          exploration-safe ones. Nothing here is fabricated: it reflects
          exactly what's true at this stage. */}
      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.onboardingComplete ? (
          <InsightTile icon={<RouteIcon size={12} />} accentVar="--accent-roadmap" label="Next milestone" href="/roadmap">
            {nextMilestone ? nextMilestone.title : "Generate a roadmap to see your next step."}
          </InsightTile>
        ) : (
          <InsightTile icon={<CompassIcon size={12} />} accentVar="--accent-assessment" label="Explore careers" href={ROUTES.careers}>
            Browse roles across every field — no assessment required.
          </InsightTile>
        )}
        <InsightTile icon={<FileTextIcon size={12} />} accentVar="--accent-resume" label="Resume tip" href="/resume">
          {data.resumeSuggestion}
        </InsightTile>
        {data.onboardingComplete ? (
          <InsightTile icon={<RocketIcon size={12} />} accentVar="--accent-assessment" label="Target company" href={target ? `/companies/${target.slug}` : "/companies"}>
            {target ? `${target.name} · ${target.readiness}% ready` : "Pick a target company to track progress."}
          </InsightTile>
        ) : (
          <InsightTile icon={<RocketIcon size={12} />} accentVar="--accent-assessment" label="Compare careers" href={ROUTES.compare}>
            See two roles side by side — salary, skills, and demand.
          </InsightTile>
        )}
        <InsightTile icon={<SparklesIcon size={12} />} accentVar="--accent-mentor" label="Recent AI insight" href="/coach">
          {data.recentInsight}
        </InsightTile>
      </div>
    </section>
  );
}
