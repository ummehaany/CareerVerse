"use client";

import { useState } from "react";
import type { AnswerValue, Option } from "../types";
import { CheckIcon, SearchIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function ChipSelect({
  options,
  value,
  max,
  onChange,
  groupLabel,
}: {
  options: Option[];
  value: AnswerValue | undefined;
  max?: number;
  onChange: (value: AnswerValue) => void;
  groupLabel: string;
}) {
  const selected = Array.isArray(value) ? value : [];
  const [query, setQuery] = useState("");
  const atMax = max ? selected.length >= max : false;
  const showSearch = options.length > 10;

  const filtered = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  function toggle(optionValue: string) {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else if (!atMax) {
      onChange([...selected, optionValue]);
    }
  }

  return (
    <div className="space-y-3">
      {showSearch && (
        <div className="relative">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter…"
            aria-label="Filter options"
            className="pl-9"
          />
        </div>
      )}
      <div className="flex flex-wrap gap-2" role="group" aria-label={groupLabel}>
        {filtered.map((option) => {
          const isSelected = selected.includes(option.value);
          const disabled = !isSelected && atMax;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              disabled={disabled}
              onClick={() => toggle(option.value)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-foreground/80 hover:border-foreground/25",
                disabled && "cursor-not-allowed opacity-45",
              )}
            >
              {isSelected && <CheckIcon size={14} />}
              {option.label}
            </button>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted">No matches for “{query}”.</p>}
      </div>
    </div>
  );
}
