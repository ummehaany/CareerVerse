import type { ActionStage } from "../types";
import { ClockIcon } from "@/components/ui/icon";

export function ActionPlan({ stages }: { stages: ActionStage[] }) {
  return (
    <ol className="relative space-y-5 border-l border-border pl-6">
      {stages.map((stage, index) => (
        <li key={stage.title} className="relative">
          <span className="absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary tabular-nums">
            {index + 1}
          </span>
          <div className="rounded-xl border border-border bg-background p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold tracking-tight">{stage.title}</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                <ClockIcon size={12} />
                {stage.timeline}
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">{stage.focus}</p>
            {stage.skills.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {stage.skills.map((s) => (
                  <span key={s} className="inline-flex rounded-full border border-border bg-foreground/[0.03] px-2 py-0.5 text-xs text-foreground/75">
                    {s}
                  </span>
                ))}
              </div>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
