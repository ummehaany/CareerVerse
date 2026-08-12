"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckIcon, ClockIcon, SparklesIcon } from "@/components/ui/icon";
import type { ReadinessResult } from "../types";
import { ScoreRing } from "./score-ring";

function SkillColumn({
  title,
  tone,
  items,
  emptyText,
}: {
  title: string;
  tone: "strong" | "improve" | "missing";
  items: string[];
  emptyText: string;
}) {
  const accent =
    tone === "strong" ? "var(--success)" : tone === "improve" ? "var(--warning)" : "var(--danger)";
  const mark = tone === "strong" ? "✓" : tone === "improve" ? "⚠" : "✗";
  return (
    <div className="rounded-xl border border-border bg-background p-4">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <span style={{ color: accent }}>{mark}</span>
          {title}
        </p>
        <span className="text-sm font-semibold tabular-nums" style={{ color: accent }}>
          {items.length}
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.length ? (
          items.map((s) => (
            <span
              key={s}
              className="inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium"
              style={{
                borderColor: `color-mix(in srgb, ${accent} 30%, transparent)`,
                background: `color-mix(in srgb, ${accent} 10%, transparent)`,
                color: accent,
              }}
            >
              {s}
            </span>
          ))
        ) : (
          <p className="text-xs text-subtle">{emptyText}</p>
        )}
      </div>
    </div>
  );
}

export function ReadinessSection({
  readiness,
  companyName,
}: {
  readiness: ReadinessResult;
  companyName: string;
}) {
  const confTone =
    readiness.confidence === "High" ? "success" : readiness.confidence === "Medium" ? "warning" : "muted";

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
          <ScoreRing value={readiness.score} size={148} />
          <div className="flex-1 space-y-2 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h2 className="text-lg font-semibold tracking-tight">
                {companyName} readiness — {readiness.roleTitle}
              </h2>
              <Badge variant={confTone as "success" | "warning" | "muted"}>
                {readiness.confidence} confidence
              </Badge>
            </div>
            <p className="text-sm text-muted">{readiness.gapSummary}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1 sm:justify-start">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                <ClockIcon size={13} /> Prep time: {readiness.prepTime}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-foreground/[0.04] px-3 py-1 text-xs font-medium text-muted">
                <SparklesIcon size={13} /> {readiness.strong.length} strengths ·{" "}
                {readiness.missing.length} gaps
              </span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <SkillColumn title="Strong skills" tone="strong" items={readiness.strong} emptyText="Add skills to your profile to see strengths." />
        <SkillColumn title="Skills to improve" tone="improve" items={readiness.improve} emptyText="Nothing flagged for improvement." />
        <SkillColumn title="Missing skills" tone="missing" items={readiness.missing} emptyText="No critical gaps — great coverage!" />
      </div>

      <Card className="flex items-start gap-2 bg-surface">
        <CheckIcon size={16} className="mt-0.5 shrink-0 text-primary" />
        <p className="text-sm text-muted">
          This readiness score compares your CareerVerse profile (skills, resume, assessments) against{" "}
          {companyName}&apos;s bar for this role. Head to the Roadmap tab for a step-by-step plan to close the gaps.
        </p>
      </Card>
    </div>
  );
}
