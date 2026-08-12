"use client";

import { useState } from "react";
import type { Milestone } from "@/types/roadmap";
import {
  CheckIcon,
  ClockIcon,
  ChevronRightIcon,
  RocketIcon,
  SparklesIcon,
} from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function MilestoneCard({
  milestone,
  index,
  completed,
  onToggle,
}: {
  milestone: Milestone;
  index: number;
  completed: boolean;
  onToggle: () => void;
}) {
  const [open, setOpen] = useState(false);
  const detailsId = `${milestone.id}-details`;
  const hasDetails =
    milestone.projects.length > 0 ||
    milestone.certifications.length > 0 ||
    milestone.resources.length > 0 ||
    milestone.skills.length > 0;

  return (
    <div
      className={cn(
        "rounded-xl border transition-colors",
        completed ? "border-success/30 bg-success/[0.04]" : "border-border bg-background",
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={completed}
          aria-label={completed ? "Mark milestone incomplete" : "Mark milestone complete"}
          className={cn(
            "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            completed
              ? "border-success bg-success text-white"
              : "border-foreground/25 text-transparent hover:border-primary",
          )}
        >
          <CheckIcon size={15} />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-subtle tabular-nums">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-subtle">
              <ClockIcon size={13} />
              {milestone.estimatedTime}
            </span>
          </div>
          <h4
            className={cn(
              "mt-1 font-medium leading-snug",
              completed && "text-muted line-through decoration-foreground/30",
            )}
          >
            {milestone.title}
          </h4>
          <p className="mt-1 text-sm text-muted">{milestone.description}</p>

          {milestone.skills.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {milestone.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex rounded-full border border-border bg-foreground/[0.03] px-2 py-0.5 text-xs text-foreground/75"
                >
                  {skill}
                </span>
              ))}
            </div>
          )}

          {hasDetails && (
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls={detailsId}
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              {open ? "Hide projects & certifications" : "Projects & certifications"}
              <ChevronRightIcon size={15} className={cn("transition-transform", open && "rotate-90")} />
            </button>
          )}

          {open && (
            <div id={detailsId} className="mt-3 space-y-4 border-t border-border pt-3">
              {milestone.projects.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <RocketIcon size={15} className="text-primary" />
                    Recommended projects
                  </p>
                  <ul className="space-y-2">
                    {milestone.projects.map((project) => (
                      <li key={project.title} className="rounded-lg border border-border bg-surface p-3">
                        <p className="text-sm font-medium">{project.title}</p>
                        <p className="mt-0.5 text-sm text-muted">{project.description}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {milestone.certifications.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <CheckIcon size={15} className="text-success" />
                    Certifications
                  </p>
                  <ul className="space-y-1">
                    {milestone.certifications.map((cert) => (
                      <li key={cert} className="flex items-start gap-2 text-sm text-muted">
                        <CheckIcon size={15} className="mt-0.5 shrink-0 text-success" />
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {milestone.resources.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-1.5 text-sm font-semibold">
                    <SparklesIcon size={15} className="text-primary" />
                    Learning resources
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {milestone.resources.map((resource) => (
                      <span
                        key={resource}
                        className="inline-flex rounded-full border border-border px-2.5 py-1 text-xs text-foreground/75"
                      >
                        {resource}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
