"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  FileTextIcon,
  RouteIcon,
  MicIcon,
  PuzzleIcon,
  SparklesIcon,
} from "@/components/ui/icon";
import type { ProgressOverview as ProgressOverviewData } from "../types";

/**
 * Read-only "Progress Overview" — pulls live signals from the user's resume,
 * roadmap, mock interviews, and skill-gap assessments into one panel, topped
 * by an overall Career Readiness score.
 */
export function ProgressOverview({ progress }: { progress: ProgressOverviewData }) {
  const metrics: Array<{
    key: string;
    label: string;
    value: number | null;
    accent: string;
    icon: typeof FileTextIcon;
    caption?: string;
  }> = [
    {
      key: "resume",
      label: "Resume completion",
      value: progress.resumeCompletion,
      accent: "var(--accent-resume)",
      icon: FileTextIcon,
    },
    {
      key: "roadmap",
      label: "Roadmap completion",
      value: progress.roadmapCompletion,
      accent: "var(--accent-roadmap)",
      icon: RouteIcon,
    },
    {
      key: "interview",
      label: "Mock interview performance",
      value: progress.interviewPerformance,
      accent: "var(--accent-interview)",
      icon: MicIcon,
      caption:
        progress.interviewCount > 0
          ? `${progress.interviewCount} interview${progress.interviewCount === 1 ? "" : "s"} taken`
          : "No interviews yet",
    },
    {
      key: "skill",
      label: "Skill readiness",
      value: progress.skillReadiness,
      accent: "var(--accent-assessment)",
      icon: PuzzleIcon,
    },
  ];

  const readiness = progress.careerReadiness;
  const readinessLabel =
    readiness >= 80
      ? "Interview-ready"
      : readiness >= 60
        ? "Nearly there"
        : readiness >= 40
          ? "Developing"
          : "Getting started";

  return (
    <Card className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <SparklesIcon size={18} className="text-primary" />
          <h2 className="text-base font-semibold tracking-tight">Progress overview</h2>
        </div>
      </div>

      {/* Career readiness headline */}
      <div className="rounded-xl border border-border bg-surface p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
              Career readiness
            </p>
            <p className="mt-1 text-sm text-muted">{readinessLabel}</p>
          </div>
          <p className="text-3xl font-bold tabular-nums text-primary">
            {readiness}
            <span className="text-base font-medium text-subtle">/100</span>
          </p>
        </div>
        <div className="mt-3">
          <Progress value={readiness} />
        </div>
      </div>

      {/* Individual signals */}
      <div className="grid gap-4 sm:grid-cols-2">
        {metrics.map((m) => {
          const Icon = m.icon;
          const has = typeof m.value === "number";
          return (
            <div key={m.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted">
                  <Icon size={15} style={{ color: m.accent }} />
                  {m.label}
                </span>
                <span className="font-semibold tabular-nums">
                  {has ? `${m.value}%` : "—"}
                </span>
              </div>
              <Progress value={has ? (m.value as number) : 0} color={m.accent} />
              {m.caption && <p className="text-xs text-subtle">{m.caption}</p>}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
