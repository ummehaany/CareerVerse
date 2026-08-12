"use client";

import { useMemo, useState } from "react";
import { SearchIcon, CheckIcon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Searchable chip selector, reused for both the single-select field step and
 * the multi-select companies step. `mode` controls selection semantics; state
 * is fully controlled by the parent so answers live in one place.
 */
export function SearchableOptions({
  options,
  selected,
  onChange,
  mode,
  placeholder = "Search…",
}: {
  options: string[];
  selected: string[];
  onChange: (next: string[]) => void;
  mode: "single" | "multi";
  placeholder?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.toLowerCase().includes(q));
  }, [options, query]);

  function toggle(option: string) {
    if (mode === "single") {
      onChange([option]);
      return;
    }
    onChange(selected.includes(option) ? selected.filter((s) => s !== option) : [...selected, option]);
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <SearchIcon
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          aria-label="Search options"
          className="pl-9"
        />
      </div>

      {mode === "multi" && selected.length > 0 && (
        <p className="text-xs text-subtle">{selected.length} selected</p>
      )}

      <div
        role="listbox"
        aria-multiselectable={mode === "multi"}
        className="flex max-h-64 flex-wrap gap-2 overflow-y-auto py-1"
      >
        {filtered.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={isSelected}
              onClick={() => toggle(option)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40",
                isSelected
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted hover:border-foreground/25 hover:text-foreground",
              )}
            >
              {isSelected && <CheckIcon size={13} />}
              {option}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-4 text-sm text-subtle">No matches. Try a different search.</p>
        )}
      </div>
    </div>
  );
}
