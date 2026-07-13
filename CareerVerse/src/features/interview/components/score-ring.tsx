import { cn } from "@/lib/utils";

/** Circular score indicator (default 0–100). Color scales with the score. */
export function ScoreRing({
  value,
  max = 100,
  size = 96,
  className,
}: {
  value: number;
  max?: number;
  size?: number;
  className?: string;
}) {
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const offset = circumference - (pct / 100) * circumference;
  const color =
    pct >= 75 ? "var(--success)" : pct >= 50 ? "var(--primary)" : pct >= 30 ? "var(--warning)" : "var(--danger)";

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-foreground/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold leading-none tabular-nums">{Math.round(value)}</span>
        <span className="text-[10px] uppercase tracking-wide text-subtle">/ {max}</span>
      </div>
    </div>
  );
}
