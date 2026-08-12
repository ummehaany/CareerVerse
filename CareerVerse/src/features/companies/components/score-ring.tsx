"use client";

/** Premium circular readiness score (0–100). Color scales with the value. */
export function ScoreRing({
  value,
  size = 132,
  label,
}: {
  value: number;
  size?: number;
  label?: string;
}) {
  const stroke = 10;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = Math.max(0, Math.min(100, value));
  const offset = circ - (pct / 100) * circ;
  const color =
    pct >= 80 ? "var(--success)" : pct >= 60 ? "var(--primary)" : pct >= 40 ? "var(--warning)" : "var(--danger)";
  const caption =
    label ?? (pct >= 80 ? "Strong fit" : pct >= 60 ? "Promising" : pct >= 40 ? "Developing" : "Early stage");

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
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
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.22,1,0.36,1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold leading-none tabular-nums">{Math.round(pct)}</span>
        <span className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-subtle">{caption}</span>
      </div>
    </div>
  );
}
