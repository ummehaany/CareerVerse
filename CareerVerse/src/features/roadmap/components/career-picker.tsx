"use client";

import { useState } from "react";
import type { CareerOption } from "../types";
import { Button } from "@/components/ui/button";
import { CheckIcon, RouteIcon, SparklesIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function CareerPicker({
  options,
  onGenerate,
  generating,
  title = "Build your learning roadmap",
  subtitle = "Pick a target career from your matches and we'll generate a personalized path.",
}: {
  options: CareerOption[];
  onGenerate: (careerTitle: string) => void;
  generating: boolean;
  title?: string;
  subtitle?: string;
}) {
  const [selected, setSelected] = useState<string | null>(options[0]?.title ?? null);

  return (
    <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <RouteIcon size={22} />
        </span>
        <div>
          <h2 className="font-semibold tracking-tight">{title}</h2>
          <p className="mt-0.5 text-sm text-muted">{subtitle}</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected === option.title;
          return (
            <button
              key={option.title}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => setSelected(option.title)}
              className={cn(
                "flex items-center justify-between gap-3 rounded-xl border p-3.5 text-left transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border bg-background hover:border-foreground/25",
              )}
            >
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{option.title}</span>
                <span className="text-xs text-subtle tabular-nums">{option.matchPercentage}% match</span>
              </span>
              <span
                className={cn(
                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-foreground/25 text-transparent",
                )}
              >
                <CheckIcon size={13} />
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5">
        <Button
          size="lg"
          onClick={() => selected && onGenerate(selected)}
          disabled={!selected}
          isLoading={generating}
        >
          <SparklesIcon size={18} />
          Generate roadmap
        </Button>
      </div>
    </div>
  );
}
