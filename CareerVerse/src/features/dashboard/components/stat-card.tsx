import type { OverviewStat } from "../config";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * `muted` visually recedes a tile that has nothing to report yet (e.g.
 * roadmap/interviews/matches before Career Discovery). The tile stays fully
 * present and readable — this only lowers its visual weight so it doesn't
 * compete with tiles that already have real progress on them.
 */
export function StatCard({ stat, muted = false }: { stat: OverviewStat; muted?: boolean }) {
  const Icon = stat.icon;
  const accent = `var(${stat.accentVar})`;

  return (
    <div className={cn("rounded-xl border border-border bg-background p-5", muted && "opacity-60")}>
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">{stat.label}</p>
        <span
          className="grid h-8 w-8 place-items-center rounded-lg"
          style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
        >
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-2 text-2xl font-semibold tracking-tight tabular-nums">{stat.value}</p>
      {stat.progress !== null && (
        <div className="mt-3">
          <Progress value={stat.progress} color={accent} />
        </div>
      )}
      <p className="mt-2 text-xs text-subtle">{stat.hint}</p>
    </div>
  );
}
