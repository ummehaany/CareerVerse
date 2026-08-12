"use client";

import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  type CareerFilters,
  EDUCATION_LEVELS,
  DEMAND_LEVELS,
  WORK_STYLES,
  EXPERIENCE_LEVELS,
  SALARY_BUCKETS,
} from "../filters";

/** Presentational smart-filters grid. State is owned by the Explorer. */
export function CareerFiltersPanel({
  filters,
  onChange,
  savedOnly,
  onToggleSaved,
}: {
  filters: CareerFilters;
  onChange: (patch: Partial<CareerFilters>) => void;
  savedOnly: boolean;
  onToggleSaved: () => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-4 rounded-2xl border border-border bg-background p-4 sm:grid-cols-2 lg:grid-cols-3 animate-fade-up">
      <div className="space-y-1.5">
        <Label htmlFor="f-education">Education level</Label>
        <Select
          id="f-education"
          value={filters.education}
          onChange={(e) => onChange({ education: e.target.value })}
        >
          <option value="all">Any education</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f-salary">Salary range</Label>
        <Select
          id="f-salary"
          value={filters.salary}
          onChange={(e) => onChange({ salary: e.target.value })}
        >
          <option value="all">Any salary</option>
          {SALARY_BUCKETS.map((bucket) => (
            <option key={bucket.key} value={bucket.key}>
              {bucket.label}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f-demand">Future demand</Label>
        <Select
          id="f-demand"
          value={filters.demand}
          onChange={(e) => onChange({ demand: e.target.value })}
        >
          <option value="all">Any demand</option>
          {DEMAND_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f-workstyle">Work style</Label>
        <Select
          id="f-workstyle"
          value={filters.workStyle}
          onChange={(e) => onChange({ workStyle: e.target.value })}
        >
          <option value="all">Any work style</option>
          {WORK_STYLES.map((style) => (
            <option key={style} value={style}>
              {style}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="f-experience">Experience level</Label>
        <Select
          id="f-experience"
          value={filters.experience}
          onChange={(e) => onChange({ experience: e.target.value })}
        >
          <option value="all">Any level</option>
          {EXPERIENCE_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Saved</Label>
        <button
          type="button"
          onClick={onToggleSaved}
          aria-pressed={savedOnly}
          className={cn(
            "flex h-10 w-full items-center justify-center rounded-md border px-4 text-sm font-medium transition-colors",
            savedOnly
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted hover:bg-foreground/5",
          )}
        >
          {savedOnly ? "Showing saved only" : "Show saved only"}
        </button>
      </div>
    </div>
  );
}
