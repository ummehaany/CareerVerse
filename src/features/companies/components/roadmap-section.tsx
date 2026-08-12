"use client";

import { Card } from "@/components/ui/card";
import {
  BookIcon,
  RocketIcon,
  TargetIcon,
  MicIcon,
  ChatIcon,
  FileTextIcon,
  RouteIcon,
} from "@/components/ui/icon";
import { AwardIcon } from "@/components/ui/icons-extended";
import type { CompanyRoadmap } from "../types";

const STEP_ICONS: Record<string, typeof BookIcon> = {
  "Learning path": BookIcon,
  Projects: RocketIcon,
  Certifications: AwardIcon,
  "Interview preparation": MicIcon,
  "Coding & practice": TargetIcon,
  Communication: ChatIcon,
  "Portfolio & resume improvements": FileTextIcon,
};

export function RoadmapSection({ roadmap }: { roadmap: CompanyRoadmap }) {
  return (
    <div className="space-y-5">
      <Card className="space-y-1 bg-surface">
        <div className="flex items-center gap-2">
          <RouteIcon size={18} className="text-primary" />
          <h2 className="text-base font-semibold tracking-tight">{roadmap.title}</h2>
        </div>
        <p className="text-sm text-muted">{roadmap.summary}</p>
      </Card>

      {/* steps */}
      <div className="grid gap-4 md:grid-cols-2">
        {roadmap.steps.map((step) => {
          const Icon = STEP_ICONS[step.title] ?? BookIcon;
          return (
            <Card key={step.title} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={16} />
                </span>
                <div>
                  <h3 className="text-sm font-semibold tracking-tight">{step.title}</h3>
                </div>
              </div>
              <p className="text-xs text-muted">{step.detail}</p>
              <ul className="space-y-1.5">
                {step.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-foreground/80">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      {/* timeline */}
      <Card className="space-y-4">
        <h3 className="text-sm font-semibold tracking-tight">Timeline with milestones</h3>
        <ol className="relative space-y-5 border-l border-border pl-6">
          {roadmap.timeline.map((phase, i) => (
            <li key={phase.phase} className="relative">
              <span className="absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary tabular-nums">
                {i + 1}
              </span>
              <div className="rounded-xl border border-border bg-surface p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold tracking-tight">{phase.phase}</p>
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                    {phase.timeframe}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted">{phase.focus}</p>
                <ul className="mt-2.5 space-y-1">
                  {phase.milestones.map((m) => (
                    <li key={m} className="flex items-start gap-2 text-sm text-foreground/80">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}
