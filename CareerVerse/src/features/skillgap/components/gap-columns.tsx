import type { AnalyzedSkill, GapAnalysis } from "../types";
import { Progress } from "@/components/ui/progress";
import { CheckIcon, TargetIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function Chip({ skill }: { skill: AnalyzedSkill }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs",
        skill.status === "mastered" && "border-success/30 bg-success/10 text-success",
        skill.status === "partial" && "border-warning/30 bg-warning/10 text-warning",
        skill.status === "missing" && "border-border bg-foreground/[0.03] text-foreground/75",
      )}
    >
      {skill.critical && <span title="Critical skill" aria-label="Critical">★</span>}
      {skill.skill}
    </span>
  );
}

function Column({
  title,
  accent,
  items,
  total,
  icon,
  emptyText,
}: {
  title: string;
  accent: string;
  items: AnalyzedSkill[];
  total: number;
  icon: React.ReactNode;
  emptyText: string;
}) {
  const pct = total ? Math.round((items.length / total) * 100) : 0;
  return (
    <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <p className="flex items-center gap-1.5 text-sm font-semibold">
          <span style={{ color: accent }}>{icon}</span>
          {title}
        </p>
        <span className="text-sm font-semibold tabular-nums" style={{ color: accent }}>
          {items.length}
        </span>
      </div>
      <div className="mt-2">
        <Progress value={pct} color={accent} />
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {items.length > 0 ? items.map((s) => <Chip key={s.skill} skill={s} />) : <p className="text-xs text-subtle">{emptyText}</p>}
      </div>
    </div>
  );
}

export function GapColumns({ analysis }: { analysis: GapAnalysis }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Column
        title="Mastered"
        accent="var(--success)"
        items={analysis.mastered}
        total={analysis.totalRequired}
        icon={<CheckIcon size={16} />}
        emptyText="No fully-mastered skills yet."
      />
      <Column
        title="Partially developed"
        accent="var(--warning)"
        items={analysis.partial}
        total={analysis.totalRequired}
        icon={<TargetIcon size={16} />}
        emptyText="Nothing in progress."
      />
      <Column
        title="Missing critical"
        accent="var(--danger)"
        items={analysis.missing}
        total={analysis.totalRequired}
        icon={<TargetIcon size={16} />}
        emptyText="No gaps — great coverage!"
      />
    </div>
  );
}
