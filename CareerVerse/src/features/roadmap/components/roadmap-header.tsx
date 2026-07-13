"use client";

import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ClockIcon, TargetIcon, RouteIcon } from "@/components/ui/icon";

export function RoadmapHeader({
  careerTitle,
  overview,
  totalEstimatedTime,
  percent,
  completedCount,
  totalMilestones,
  onNew,
}: {
  careerTitle: string;
  overview: string;
  totalEstimatedTime: string;
  percent: number;
  completedCount: number;
  totalMilestones: number;
  onNew: () => void;
}) {
  const complete = totalMilestones > 0 && completedCount === totalMilestones;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
            <RouteIcon size={16} />
            Learning roadmap
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{careerTitle}</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">{overview}</p>
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <ClockIcon size={15} className="text-subtle" />
              {totalEstimatedTime}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <TargetIcon size={15} className="text-subtle" />
              {totalMilestones} milestones
            </span>
          </div>
        </div>
        <Button variant="outline" onClick={onNew} className="shrink-0">
          New roadmap
        </Button>
      </div>

      <div className="mt-5 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {complete ? "Roadmap complete" : "Your progress"}
          </span>
          <span className="tabular-nums text-muted">
            {completedCount}/{totalMilestones} · {percent}%
          </span>
        </div>
        <Progress value={percent} label="Roadmap progress" />
      </div>
    </section>
  );
}
