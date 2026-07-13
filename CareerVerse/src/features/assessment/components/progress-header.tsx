"use client";

import type { Section } from "../types";
import type { SaveStatus } from "../hooks/use-autosave";
import { Progress } from "@/components/ui/progress";
import { OptionIcon } from "./option-icon";
import { CheckIcon, ClockIcon } from "@/components/ui/icon";
import { TOTAL_QUESTIONS } from "../questions";
import { cn } from "@/lib/utils";

function SaveIndicator({ status }: { status: SaveStatus }) {
  const label =
    status === "saving"
      ? "Saving…"
      : status === "saved"
        ? "Saved"
        : status === "error"
          ? "Save failed — retrying"
          : "Autosaves";

  return (
    <span
      aria-live="polite"
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-medium",
        status === "error" ? "text-danger" : "text-subtle",
      )}
    >
      {status === "saved" ? (
        <CheckIcon size={13} className="text-success" />
      ) : (
        <span
          className={cn(
            "h-1.5 w-1.5 rounded-full",
            status === "saving" ? "animate-pulse bg-primary" : "bg-foreground/30",
          )}
        />
      )}
      {label}
    </span>
  );
}

export function ProgressHeader({
  stepIndex,
  stepCount,
  section,
  progressPercent,
  answeredTotal,
  saveStatus,
}: {
  stepIndex: number;
  stepCount: number;
  section: Section;
  progressPercent: number;
  answeredTotal: number;
  saveStatus: SaveStatus;
}) {
  const minutesLeft = Math.max(1, Math.ceil(((TOTAL_QUESTIONS - answeredTotal) * 18) / 60));

  return (
    <div className="sticky top-16 z-10 -mx-4 border-b border-border bg-surface/85 px-4 py-4 backdrop-blur sm:mx-0 sm:rounded-2xl sm:border sm:bg-background sm:px-6">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
            <OptionIcon name={section.icon} size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-subtle">
              Step {stepIndex + 1} of {stepCount}
            </p>
            <p className="truncate text-sm font-semibold">{section.title}</p>
          </div>
        </div>
        <SaveIndicator status={saveStatus} />
      </div>

      <Progress value={progressPercent} label="Assessment progress" />

      <div className="mt-2 flex items-center justify-between text-xs text-subtle">
        <span className="font-medium tabular-nums text-muted">{progressPercent}% complete</span>
        <span className="inline-flex items-center gap-1">
          <ClockIcon size={13} />~{minutesLeft} min left
        </span>
      </div>
    </div>
  );
}
