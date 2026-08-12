import { cn } from "@/lib/utils";

/** Circular Career Readiness score (0–100). Color scales with the score. */
export function ReadinessRing({ value, size = 120, className }: { value: number; size?: number; className?: string }) {
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circ - (pct / 100) * circ;
  const color =
    pct >= 80 ? "var(--success)" : pct >= 60 ? "var(--primary)" : pct >= 40 ? "var(--warning)" : "var(--danger)";
  const label = pct >= 80 ? "Interview-ready" : pct >= 60 ? "Nearly there" : pct >= 40 ? "Developing" : "Early stage";

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
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 800ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold leading-none tabular-nums">{Math.round(pct)}</span>
        <span className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-subtle">{label}</span>
      </div>
    </div>
  );
}
