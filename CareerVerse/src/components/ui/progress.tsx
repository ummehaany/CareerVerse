import { cn } from "@/lib/utils";

export interface ProgressProps {
  /** 0–100. */
  value: number;
  className?: string;
  /** Track fill color; defaults to the brand color. Accepts any CSS color. */
  color?: string;
  label?: string;
}

/**
 * Thin meter for magnitude (profile completeness, roadmap progress, …).
 * A 4px rounded track anchored at the baseline, per the data-viz mark spec.
 */
export function Progress({ value, className, color, label }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-foreground/10", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-full transition-[width] duration-500 ease-out"
        style={{ width: `${clamped}%`, backgroundColor: color ?? "var(--primary)" }}
      />
    </div>
  );
}
