"use client";

import { useState } from "react";
import Link from "next/link";
import type { RoadmapDoc, RoadmapMilestone, RoadmapResource } from "@/types/roadmap";
import { toggleMilestoneAction } from "../actions";
import { Progress } from "@/components/ui/progress";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import {
  CheckIcon,
  ChevronRightIcon,
  BookIcon,
  PlayIcon,
  FileTextIcon,
  GlobeIcon,
  PlusIcon,
  ArrowRightIcon,
  RouteIcon,
} from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

function ResourceIcon({ type }: { type: RoadmapResource["type"] }) {
  switch (type) {
    case "video":
      return <PlayIcon size={16} className="text-red-500" />;
    case "article":
      return <FileTextIcon size={16} className="text-blue-500" />;
    case "book":
      return <BookIcon size={16} className="text-yellow-600 dark:text-yellow-500" />;
    case "course":
      return <BookIcon size={16} className="text-green-500" />;
    default:
      return <GlobeIcon size={16} className="text-purple-500" />;
  }
}

export function RoadmapDetailView({ roadmap }: { roadmap: RoadmapDoc }) {
  const [milestones, setMilestones] = useState<RoadmapMilestone[]>(roadmap.milestones);
  const [progress, setProgress] = useState<number>(roadmap.progress);
  const [togglingIndex, setTogglingIndex] = useState<number | null>(null);
  const [expandedIndices, setExpandedIndices] = useState<Record<number, boolean>>(() => {
    // Expand the first milestone by default, or the first uncompleted one
    const firstUncompleted = roadmap.milestones.findIndex((m) => m.status !== "completed");
    const initial: Record<number, boolean> = {};
    const defaultIndex = firstUncompleted !== -1 ? firstUncompleted : 0;
    initial[defaultIndex] = true;
    return initial;
  });
  const [error, setError] = useState<string | null>(null);

  function toggleExpand(index: number) {
    setExpandedIndices((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }

  async function handleToggleMilestone(index: number, e: React.MouseEvent) {
    e.stopPropagation(); // Prevent card expansion toggle when clicking checkbox
    if (togglingIndex !== null) return;

    const currentMilestone = milestones[index];
    if (!currentMilestone) return;

    const currentStatus = currentMilestone.status;
    const nextStatus: RoadmapMilestone["status"] = currentStatus === "completed" ? "not_started" : "completed";

    // Optimistic Update
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = { ...currentMilestone, status: nextStatus };

    const completedCount = updatedMilestones.filter((m) => m.status === "completed").length;
    const nextProgress = Math.round((completedCount / updatedMilestones.length) * 100);

    setMilestones(updatedMilestones);
    setProgress(nextProgress);
    setTogglingIndex(index);
    setError(null);

    const result = await toggleMilestoneAction(roadmap.id, index, currentStatus);

    setTogglingIndex(null);
    if (!result.ok) {
      // Rollback on failure
      setMilestones(milestones);
      setProgress(progress);
      setError(result.error);
    }
  }

  const completedCount = milestones.filter((m) => m.status === "completed").length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href={ROUTES.roadmap} className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline">
              Roadmaps
            </Link>
            <ChevronRightIcon size={12} className="text-muted" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              {roadmap.targetCareer}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{roadmap.title}</h1>
          <p className="text-sm text-muted">{roadmap.description}</p>
        </div>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {/* Progress Card */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between text-sm font-medium">
          <span className="text-muted">Active Roadmap Progress</span>
          <span className="text-foreground">
            {progress}% Completed ({completedCount} of {milestones.length} milestones)
          </span>
        </div>
        <Progress value={progress} color="var(--accent-roadmap)" />
      </Card>

      {/* Timeline Milestones */}
      <div className="relative border-l border-border pl-6 ml-3 space-y-6">
        {milestones.map((milestone, index) => {
          const isCompleted = milestone.status === "completed";
          const isExpanded = expandedIndices[index];
          const isToggling = togglingIndex === index;

          return (
            <div key={index} className="relative">
              {/* Timeline Dot Indicator */}
              <span
                onClick={(e) => handleToggleMilestone(index, e)}
                className={cn(
                  "absolute -left-10 top-1.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border text-xs transition-colors",
                  isCompleted
                    ? "border-emerald-500 bg-emerald-500 text-white hover:bg-emerald-600"
                    : "border-border bg-background text-muted hover:border-foreground/30",
                )}
              >
                {isToggling ? (
                  <Spinner className="h-3 w-3 text-current" />
                ) : isCompleted ? (
                  <CheckIcon size={14} />
                ) : (
                  index + 1
                )}
              </span>

              {/* Milestone Card */}
              <Card
                className={cn(
                  "overflow-hidden p-0 transition-all cursor-pointer hover:border-foreground/15",
                  isCompleted && "bg-foreground/[0.01]",
                )}
                onClick={() => toggleExpand(index)}
              >
                {/* Milestone Header */}
                <div className="flex items-center justify-between p-5">
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Milestone {index + 1}
                    </span>
                    <h3
                      className={cn(
                        "text-base font-semibold leading-snug tracking-tight mt-0.5",
                        isCompleted && "text-muted line-through",
                      )}
                    >
                      {milestone.title}
                    </h3>
                  </div>
                  <ChevronRightIcon
                    size={18}
                    className={cn("text-muted transition-transform ml-4 shrink-0", isExpanded && "rotate-90")}
                  />
                </div>

                {/* Milestone Details */}
                {isExpanded && (
                  <div className="border-t border-border bg-foreground/[0.01] p-5 space-y-4">
                    <p className="text-sm text-muted leading-relaxed">{milestone.description}</p>

                    {/* Target Skills */}
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-semibold text-foreground/80">Target Skills</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {milestone.skills.map((skill) => (
                          <Badge key={skill} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Curated Resources */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-foreground/80">Learning Resources</h4>
                      <div className="grid gap-2">
                        {milestone.resources.map((resource, rIndex) => (
                          <div
                            key={rIndex}
                            className="flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-sm hover:border-foreground/15"
                          >
                            <span className="mt-0.5 shrink-0">
                              <ResourceIcon type={resource.type} />
                            </span>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <p className="font-medium text-foreground/80 leading-snug">
                                {resource.title}
                              </p>
                              <div className="flex items-center gap-2 text-xs text-muted">
                                <span className="capitalize">{resource.type}</span>
                                {resource.url && (
                                  <>
                                    <span>•</span>
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline flex items-center gap-0.5"
                                      onClick={(e) => e.stopPropagation()} // Prevent card collapse toggle
                                    >
                                      View resource
                                      <ArrowRightIcon size={10} />
                                    </a>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          );
        })}
      </div>
    </div>
  );
}
