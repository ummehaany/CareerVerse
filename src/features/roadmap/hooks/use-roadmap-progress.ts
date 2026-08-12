"use client";

import { useMemo, useState } from "react";
import type { MilestoneStatus } from "@/types/roadmap";
import { updateMilestoneStatus } from "../actions";

/**
 * Optimistic milestone progress. Loads the persisted map (auto-resume) and
 * writes changes back through the server action, reverting on failure.
 */
export function useRoadmapProgress(
  roadmapId: string,
  initial: Record<string, MilestoneStatus>,
  totalMilestones: number,
) {
  const [progress, setProgress] = useState<Record<string, MilestoneStatus>>(initial);
  const [error, setError] = useState<string | null>(null);

  async function toggle(milestoneId: string) {
    const wasCompleted = progress[milestoneId] === "completed";
    const next: MilestoneStatus = wasCompleted ? "not_started" : "completed";

    setProgress((prev) => ({ ...prev, [milestoneId]: next }));
    setError(null);

    const result = await updateMilestoneStatus({ roadmapId, milestoneId, status: next });
    if (!result.ok) {
      setProgress((prev) => ({
        ...prev,
        [milestoneId]: wasCompleted ? "completed" : "not_started",
      }));
      setError(result.error);
    }
  }

  const completedCount = useMemo(
    () => Object.values(progress).filter((status) => status === "completed").length,
    [progress],
  );

  const percent = totalMilestones === 0 ? 0 : Math.round((completedCount / totalMilestones) * 100);

  function isCompleted(milestoneId: string): boolean {
    return progress[milestoneId] === "completed";
  }

  return { progress, toggle, isCompleted, completedCount, percent, error };
}
