import type { OverviewStat } from "../config";
import { Progress } from "@/components/ui/progress";

export function StatCard({ stat }: { stat: OverviewStat }) {
  const Icon = stat.icon;
  const accent = `var(${stat.accentVar})`;

  return (
    <div className="rounded-xl border border-border bg-background p-5">
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
