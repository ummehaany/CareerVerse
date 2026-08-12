"use client";

import type { InterviewPageData, RecentInterview } from "../queries";
import { interviewTypeMeta, DIFFICULTY_LABEL, INTERVIEW_TYPES } from "../config";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MicIcon,
  PlayIcon,
  TrendingUpIcon,
  TargetIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@/components/ui/icon";

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 240;
  const h = 44;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - (Math.max(0, Math.min(100, v)) / 100) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-11 w-full" preserveAspectRatio="none" aria-hidden="true">
      <polyline points={points} fill="none" stroke="var(--primary)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function StatTile({
  label,
  value,
  icon,
  accentVar,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  accentVar: string;
}) {
  const accent = `var(${accentVar})`;
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">{label}</p>
        <span
          className="grid h-7 w-7 place-items-center rounded-lg"
          style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
        >
          {icon}
        </span>
      </div>
      <p className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">{value}</p>
    </div>
  );
}

function HistoryRow({ item }: { item: RecentInterview }) {
  const meta = item.type ? interviewTypeMeta(item.type) : null;
  const date = item.createdAtMs ? new Date(item.createdAtMs).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : null;
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{item.role}</p>
        <p className="flex flex-wrap items-center gap-x-2 text-xs capitalize text-subtle">
          {meta && <span>{meta.short}</span>}
          <span>{DIFFICULTY_LABEL[item.difficulty] ?? item.difficulty}</span>
          <span>· {item.questionCount} Qs</span>
          {date && <span>· {date}</span>}
        </p>
      </div>
      {item.overallScore !== null && (
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary tabular-nums">
          {item.overallScore}/100
        </span>
      )}
    </div>
  );
}

export function InterviewDashboard({
  data,
  hasDraft,
  draftLabel,
  onStartNew,
  onContinue,
  onDiscardDraft,
}: {
  data: InterviewPageData;
  hasDraft: boolean;
  draftLabel: string | null;
  onStartNew: () => void;
  onContinue: () => void;
  onDiscardDraft: () => void;
}) {
  const { analytics, recent } = data;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Continue previous */}
      {hasDraft && (
        <section className="overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-background p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <PlayIcon size={15} />
                Continue previous interview
              </p>
              {draftLabel && <p className="mt-0.5 truncate text-sm text-muted">{draftLabel}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={onDiscardDraft}>
                Discard
              </Button>
              <Button size="sm" onClick={onContinue}>
                Resume
                <ArrowRightIcon size={15} />
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Start new */}
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-primary/10 text-primary">
              <MicIcon size={24} />
            </span>
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Practice a mock interview</h2>
              <p className="mt-0.5 max-w-md text-sm text-muted">
                Choose a type and role, answer one question at a time with a timer, and get AI feedback with a skill breakdown.
              </p>
            </div>
          </div>
          <Button size="lg" onClick={onStartNew} className="shrink-0">
            <SparklesIcon size={18} />
            Start new interview
          </Button>
        </div>
        <div className="mt-5 flex flex-wrap gap-1.5">
          {INTERVIEW_TYPES.map((t) => (
            <span key={t.value} className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-muted">
              {t.short}
            </span>
          ))}
        </div>
      </section>

      {/* Performance summary */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Performance summary</h2>
        {analytics.count === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-10 text-center">
            <p className="text-sm text-muted">No interviews yet — your scores and trends will appear here.</p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="grid grid-cols-3 gap-3 lg:col-span-2">
              <StatTile label="Interviews" value={String(analytics.count)} icon={<MicIcon size={15} />} accentVar="--accent-assessment" />
              <StatTile label="Average" value={analytics.averageScore !== null ? `${analytics.averageScore}` : "—"} icon={<TargetIcon size={15} />} accentVar="--accent-mentor" />
              <StatTile label="Best" value={analytics.bestScore !== null ? `${analytics.bestScore}` : "—"} icon={<TrendingUpIcon size={15} />} accentVar="--accent-roadmap" />
              <div className="col-span-3 rounded-xl border border-border bg-background p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted">Improvement trend</p>
                  <span className="inline-flex items-center gap-1 text-xs text-subtle">
                    <TrendingUpIcon size={13} /> last {analytics.trend.length}
                  </span>
                </div>
                {analytics.trend.length >= 2 ? (
                  <Sparkline values={analytics.trend} />
                ) : (
                  <p className="mt-2 text-xs text-subtle">Complete another interview to see your trend.</p>
                )}
              </div>
            </div>
            <div className="space-y-3 rounded-xl border border-border bg-background p-4">
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-success">
                  <SparklesIcon size={13} /> Strongest skills
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {analytics.strongest.length > 0 ? (
                    analytics.strongest.map((s) => (
                      <Badge key={s} variant="success">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-subtle">—</span>
                  )}
                </div>
              </div>
              <div>
                <p className="flex items-center gap-1.5 text-xs font-semibold text-warning">
                  <TargetIcon size={13} /> Focus areas
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {analytics.weakest.length > 0 ? (
                    analytics.weakest.map((s) => (
                      <Badge key={s} variant="warning">
                        {s}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-subtle">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* History */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Interview history</h2>
        {recent.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-10 text-center">
            <p className="text-sm text-muted">Your completed interviews will show up here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recent.map((item) => (
              <HistoryRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
