import { SparklesIcon } from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { SampleMatch } from "../config";

function alignmentColor(pct: number): string {
  return pct >= 85 ? "var(--success)" : pct >= 70 ? "var(--primary)" : "var(--warning)";
}

/**
 * A single illustrative career-match row — visually modeled on the real
 * Career Discovery results screen (MatchCard in
 * features/assessment/discovery/components/discovery-results.tsx: same
 * alignment-percentage + Progress-bar + driver-chip language) so the
 * marketing preview reads as an authentic product surface, not a mockup.
 */
export function MatchPreviewCard({
  match,
  rank,
  compact = false,
}: {
  match: SampleMatch;
  rank: number;
  compact?: boolean;
}) {
  const color = alignmentColor(match.matchPercent);

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border bg-background p-3.5",
        rank === 0 ? "border-primary/30" : "border-border",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {rank === 0 && (
            <span className="mb-0.5 inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-primary">
              <SparklesIcon size={11} /> Top match
            </span>
          )}
          <p className="truncate text-sm font-semibold tracking-tight">{match.title}</p>
          <p className="text-xs text-subtle">{match.category}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-bold tabular-nums" style={{ color }}>
            {match.matchPercent}%
          </p>
          <p className="text-[9px] font-medium uppercase tracking-wide text-subtle">alignment</p>
        </div>
      </div>

      <Progress value={match.matchPercent} color={color} label={`${match.title} alignment ${match.matchPercent}%`} />

      {!compact && (
        <div className="border-t border-border pt-2">
          <p className="text-xs text-foreground/70">{match.explanation}</p>
          {match.drivers.length > 0 && (
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {match.drivers.map((d) => (
                <span
                  key={d}
                  className="rounded-full border border-primary/25 bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary"
                >
                  {d}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
