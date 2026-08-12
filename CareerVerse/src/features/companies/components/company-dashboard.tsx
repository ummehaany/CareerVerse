"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RouteIcon, MicIcon, FileTextIcon, TargetIcon, SparklesIcon } from "@/components/ui/icon";
import { BookmarkFilledIcon, StarIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import type { CompanyDashboardData, DreamSpotlight, SavedCompanyView } from "../types";
import { ScoreRing } from "./score-ring";

function DreamSpotlightCard({ s }: { s: DreamSpotlight }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl border border-border p-5"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${s.brand} 22%, var(--background)) 0%, var(--background) 68%)`,
      }}
    >
      <div
        className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full blur-3xl"
        style={{ background: `color-mix(in srgb, ${s.brand} 28%, transparent)` }}
        aria-hidden="true"
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center">
        <ScoreRing value={s.score} size={116} label="Readiness" />
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary">
            <StarIcon size={13} /> My target company
          </div>
          <h3 className="text-lg font-bold tracking-tight">
            {s.name}
            <span className="text-sm font-normal text-muted"> · {s.roleTitle}</span>
          </h3>
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted">
              <span>Preparation progress</span>
              <span className="font-medium tabular-nums">{s.preparation}%</span>
            </div>
            <Progress value={s.preparation} />
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">Next: {s.nextTask}</span>
            <span className="rounded-full bg-foreground/[0.04] px-2.5 py-1 font-medium text-muted">ETA: {s.prepTime}</span>
            <span className="rounded-full bg-foreground/[0.04] px-2.5 py-1 font-medium text-muted">{s.confidence} confidence</span>
          </div>
          {s.remainingSkills.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <span className="text-xs text-subtle">Remaining:</span>
              {s.remainingSkills.slice(0, 6).map((sk) => (
                <span key={sk} className="rounded-full border border-border bg-background px-2 py-0.5 text-xs text-foreground/75">
                  {sk}
                </span>
              ))}
            </div>
          )}
          <Link
            href={`${ROUTES.companies}/${s.slug}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Open my preparation →
          </Link>
        </div>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof RouteIcon;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted">
        <Icon size={14} style={{ color: accent }} />
        {label}
      </div>
      <p className="mt-1 text-lg font-bold tabular-nums">{value}</p>
    </div>
  );
}

function CompanyRow({ company }: { company: SavedCompanyView }) {
  const color =
    company.readiness >= 80 ? "var(--success)" : company.readiness >= 60 ? "var(--primary)" : company.readiness >= 40 ? "var(--warning)" : "var(--danger)";
  return (
    <Link
      href={`${ROUTES.companies}/${company.slug}`}
      className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2 transition-colors hover:border-foreground/20"
    >
      <span className="flex min-w-0 items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold text-white" style={{ background: company.brand }}>
          {company.name.slice(0, 1)}
        </span>
        <span className="truncate text-sm font-medium">{company.name}</span>
      </span>
      <span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color }}>
        {company.readiness}%
      </span>
    </Link>
  );
}

export function CompanyDashboard({ data }: { data: CompanyDashboardData }) {
  const hasActivity = data.savedCount > 0 || data.dreamCount > 0 || data.recent.length > 0;

  return (
    <Card className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <SparklesIcon size={18} className="text-primary" />
          <h2 className="text-base font-semibold tracking-tight">Your company dashboard</h2>
        </div>
        {data.topPick && (
          <Link
            href={`${ROUTES.companies}/${data.topPick.slug}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            Top match: {data.topPick.name} ({data.topPick.score}%)
          </Link>
        )}
      </div>

      {data.dreamSpotlight && <DreamSpotlightCard s={data.dreamSpotlight} />}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Metric icon={BookmarkFilledIcon} label="Saved" value={`${data.savedCount}`} accent="var(--accent-assessment)" />
        <Metric icon={StarIcon} label="Target" value={`${data.dreamCount}`} accent="var(--accent-interview)" />
        <Metric icon={RouteIcon} label="Roadmap" value={`${data.roadmapCompletion}%`} accent="var(--accent-roadmap)" />
        <Metric
          icon={MicIcon}
          label="Interview"
          value={data.interviewReadiness === null ? "—" : `${data.interviewReadiness}%`}
          accent="var(--accent-mentor)"
        />
        <Metric icon={FileTextIcon} label="Resume" value={`${data.resumeReadiness}%`} accent="var(--accent-resume)" />
      </div>

      {!hasActivity ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-6 text-center">
          <p className="text-sm text-muted">
            Save companies and mark your top targets to track your readiness here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
              <StarIcon size={13} /> Target companies
            </p>
            {data.dream.length ? (
              data.dream.slice(0, 4).map((c) => <CompanyRow key={c.slug} company={c} />)
            ) : (
              <p className="text-xs text-subtle">None yet.</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
              <BookmarkFilledIcon size={13} /> Saved
            </p>
            {data.saved.length ? (
              data.saved.slice(0, 4).map((c) => <CompanyRow key={c.slug} company={c} />)
            ) : (
              <p className="text-xs text-subtle">None yet.</p>
            )}
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
              <TargetIcon size={13} /> Recently viewed
            </p>
            {data.recent.length ? (
              data.recent.slice(0, 4).map((c) => (
                <Link
                  key={c.slug}
                  href={`${ROUTES.companies}/${c.slug}`}
                  className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 transition-colors hover:border-foreground/20"
                >
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold text-white" style={{ background: c.brand }}>
                    {c.name.slice(0, 1)}
                  </span>
                  <span className="truncate text-sm font-medium">{c.name}</span>
                </Link>
              ))
            ) : (
              <p className="text-xs text-subtle">None yet.</p>
            )}
          </div>
        </div>
      )}

      {(data.roadmapCompletion > 0 || data.resumeReadiness > 0) && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted">
              <span>Overall preparation</span>
              <span className="font-medium tabular-nums">
                {Math.round((data.roadmapCompletion + data.resumeReadiness) / 2)}%
              </span>
            </div>
            <Progress value={(data.roadmapCompletion + data.resumeReadiness) / 2} />
          </div>
        </div>
      )}
    </Card>
  );
}
