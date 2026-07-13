"use client";

import type { AnswerValue, ScaleConfig } from "../types";
import { cn } from "@/lib/utils";

export function ScaleInput({
  scale,
  value,
  onChange,
  invalid,
  groupLabel,
}: {
  scale: ScaleConfig;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  invalid?: boolean;
  groupLabel: string;
}) {
  const current = typeof value === "number" ? value : null;
  const steps: number[] = [];
  for (let i = scale.min; i <= scale.max; i += 1) steps.push(i);

  return (
    <div>
      <div
        role="radiogroup"
        aria-label={groupLabel}
        aria-invalid={invalid || undefined}
        className="flex gap-2"
      >
        {steps.map((step) => {
          const isSelected = current === step;
          return (
            <button
              key={step}
              type="button"
              role="radio"
              aria-checked={isSelected}
              aria-label={`${step}`}
              onClick={() => onChange(step)}
              className={cn(
                "flex h-12 flex-1 items-center justify-center rounded-xl border text-sm font-semibold tabular-nums transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground shadow-sm"
                  : "border-border bg-background text-foreground/70 hover:border-primary/40 hover:text-foreground",
              )}
            >
              {step}
            </button>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between text-xs text-subtle">
        <span>{scale.minLabel}</span>
        <span>{scale.maxLabel}</span>
      </div>
    </div>
  );
}
