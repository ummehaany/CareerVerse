import type { SavedAssessmentView } from "../queries";
import { TrendingUpIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function HistoryPanel({ history }: { history: SavedAssessmentView[] }) {
  if (history.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-10 text-center">
        <p className="text-sm text-muted">Saved assessments will appear here so you can track progress over time.</p>
      </div>
    );
  }

  // history is newest-first; delta compares each entry to the next-older one.
  return (
    <div className="space-y-2">
      {history.map((item, i) => {
        const older = history[i + 1];
        const delta = older ? item.readinessScore - older.readinessScore : null;
        const date = item.createdAtMs
          ? new Date(item.createdAtMs).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
          : null;
        return (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{item.careerTitle}</p>
              {date && <p className="text-xs text-subtle">{date}</p>}
            </div>
            <div className="flex items-center gap-2">
              {delta !== null && delta !== 0 && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
                    delta > 0 ? "text-success" : "text-danger",
                  )}
                >
                  <TrendingUpIcon size={12} className={delta > 0 ? "" : "rotate-180"} />
                  {delta > 0 ? "+" : ""}
                  {delta}
                </span>
              )}
              <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary tabular-nums">
                {item.readinessScore}/100
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
