"use client";

import { useId } from "react";
import type { Point } from "../types";

/** Lightweight inline SVG area/line chart. Scales to its container width. */
export function LineChart({
  points,
  color = "var(--primary)",
  height = 168,
  suffix = "",
  ariaLabel = "Trend chart",
}: {
  points: Point[];
  color?: string;
  height?: number;
  suffix?: string;
  ariaLabel?: string;
}) {
  const gradId = useId();
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
  const x = (i: number) => padX + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => padTop + innerH - (v / max) * innerH;

  const line = points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p.value).toFixed(1)}`).join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)},${(padTop + innerH).toFixed(1)} L${x(0).toFixed(1)},${(padTop + innerH).toFixed(1)} Z`;

  const labelIdx = n <= 7 ? points.map((_, i) => i) : [0, Math.floor((n - 1) / 2), n - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.28" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
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
      <path d={area} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={x(n - 1)} cy={y(points[n - 1].value)} r={3.5} fill={color} />
      {labelIdx.map((i) => (
        <text key={i} x={x(i)} y={H - 7} textAnchor="middle" className="fill-subtle text-[9px]">
          {points[i].label}
        </text>
      ))}
      <text x={x(n - 1)} y={Math.max(12, y(points[n - 1].value) - 8)} textAnchor="end" className="fill-muted text-[10px] font-semibold">
        {points[n - 1].value}
        {suffix}
      </text>
    </svg>
  );
}
