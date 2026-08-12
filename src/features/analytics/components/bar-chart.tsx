"use client";

import type { Point } from "../types";

/** Inline SVG bar chart. Scales to its container width. */
export function BarChart({
  points,
  color = "var(--primary)",
  height = 168,
  suffix = "",
  ariaLabel = "Bar chart",
}: {
  points: Point[];
  color?: string;
  height?: number;
  suffix?: string;
  ariaLabel?: string;
}) {
  const W = 320;
  const H = height;
  const padX = 10;
  const padTop = 14;
  const padBottom = 24;
  const innerW = W - padX * 2;
  const innerH = H - padTop - padBottom;

  if (points.length === 0) {
    return (
      <div className="grid h-40 place-items-center rounded-lg border border-dashed border-border text-sm text-subtle">
        No data yet
      </div>
    );
  }

  const max = Math.max(1, ...points.map((p) => p.value));
  const n = points.length;
  const gap = 6;
  const bw = (innerW - gap * (n - 1)) / n;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel} preserveAspectRatio="none">
      {[0, 0.5, 1].map((g) => (
        <line
          key={g}
          x1={padX}
          x2={W - padX}
          y1={padTop + innerH * g}
          y2={padTop + innerH * g}
          className="stroke-foreground/8"
          strokeWidth={1}
        />
      ))}
      {points.map((p, i) => {
        const h = (p.value / max) * innerH;
        const bx = padX + i * (bw + gap);
        const by = padTop + innerH - h;
        return (
          <g key={i}>
            <rect
              x={bx}
              y={by}
              width={bw}
              height={Math.max(0, h)}
              rx={Math.min(4, bw / 2)}
              fill={color}
              opacity={p.value > 0 ? 0.9 : 0.15}
              style={{ transition: "height 700ms ease, y 700ms ease" }}
            />
            <text x={bx + bw / 2} y={H - 7} textAnchor="middle" className="fill-subtle text-[9px]">
              {p.label}
            </text>
          </g>
        );
      })}
      <text x={W - padX} y={11} textAnchor="end" className="fill-subtle text-[9px]">
        max {max}
        {suffix}
      </text>
    </svg>
  );
}
