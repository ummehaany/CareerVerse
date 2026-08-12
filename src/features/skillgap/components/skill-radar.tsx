import type { CategoryScore } from "../types";
import { Progress } from "@/components/ui/progress";

const SHORT: Record<string, string> = {
  "Core / Technical": "Core",
  "Tools & Tech": "Tools",
  "Problem Solving": "Problem",
  Communication: "Comms",
  Leadership: "Lead",
  Domain: "Domain",
};

/** Radar chart of category readiness (falls back to bars when < 3 categories). */
export function SkillRadar({ categories }: { categories: CategoryScore[] }) {
  if (categories.length < 3) {
    return (
      <div className="space-y-2.5">
        {categories.map((c) => (
          <div key={c.category} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">{c.category}</span>
              <span className="font-medium tabular-nums">{c.score}%</span>
            </div>
            <Progress value={c.score} />
          </div>
        ))}
      </div>
    );
  }

  const size = 240;
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size / 2 - 30;
  const n = categories.length;
  const angleFor = (i: number) => (-90 + (i * 360) / n) * (Math.PI / 180);

  const point = (i: number, r: number) => {
    const a = angleFor(i);
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  };

  const grid = [0.25, 0.5, 0.75, 1].map((level) =>
    categories.map((_, i) => point(i, maxR * level)).map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
  );

  const shape = categories
    .map((c, i) => point(i, maxR * (Math.max(0, Math.min(100, c.score)) / 100)))
    .map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="mx-auto h-auto w-full max-w-[280px]" role="img" aria-label="Skill category readiness radar">
      {grid.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" className="stroke-foreground/10" strokeWidth={1} />
      ))}
      {categories.map((_, i) => {
        const p = point(i, maxR);
        return <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} className="stroke-foreground/10" strokeWidth={1} />;
      })}
      <polygon points={shape} fill="color-mix(in srgb, var(--primary) 18%, transparent)" stroke="var(--primary)" strokeWidth={2} strokeLinejoin="round" />
      {categories.map((c, i) => {
        const p = point(i, maxR + 14);
        return (
          <text
            key={c.category}
            x={p.x}
            y={p.y}
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-muted text-[9px] font-medium"
          >
            {SHORT[c.category] ?? c.category}
          </text>
        );
      })}
    </svg>
  );
}
