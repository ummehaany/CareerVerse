"use client";

import type { RoadmapStage } from "@/types/roadmap";
import { MilestoneCard } from "./milestone-card";
import { ClockIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const LEVEL_LABEL: Record<RoadmapStage["level"], string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export function StageSection({
  stage,
  index,
  isCompleted,
  onToggle,
}: {
  stage: RoadmapStage;
  index: number;
  isCompleted: (milestoneId: string) => boolean;
  onToggle: (milestoneId: string) => void;
}) {
  const completed = stage.milestones.filter((m) => isCompleted(m.id)).length;
  const total = stage.milestones.length;
  const done = total > 0 && completed === total;

  return (
    <section className="relative">
      <div className="mb-4 flex items-start gap-3">
        <span
          className={cn(
            "grid h-10 w-10 shrink-0 place-items-center rounded-xl text-sm font-bold tabular-nums transition-colors",
            done ? "bg-success text-white" : "bg-primary/10 text-primary",
          )}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="rounded-full bg-foreground/[0.05] px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-muted">
              {LEVEL_LABEL[stage.level]}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-subtle">
              <ClockIcon size={13} />
              {stage.estimatedTime}
            </span>
            <span className="text-xs tabular-nums text-subtle">
              {completed}/{total} done
            </span>
          </div>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{stage.title}</h3>
          <p className="mt-0.5 text-sm text-muted">{stage.summary}</p>
        </div>
      </div>

      <div className="space-y-3 sm:pl-[3.25rem]">
        {stage.milestones.map((milestone, milestoneIndex) => (
          <MilestoneCard
            key={milestone.id}
            milestone={milestone}
            index={milestoneIndex}
            completed={isCompleted(milestone.id)}
            onToggle={() => onToggle(milestone.id)}
          />
        ))}
      </div>
    </section>
  );
}
