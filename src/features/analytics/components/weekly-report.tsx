"use client";

import { Card } from "@/components/ui/card";
import { AwardIcon } from "@/components/ui/icons-extended";
import { CheckCircleIcon, SparklesIcon, FlagIcon, PuzzleIcon } from "@/components/ui/icon";
import type { WeeklyReport as WeeklyReportData } from "../types";

function Block({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof AwardIcon;
  title: string;
  items: string[];
}) {
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
        <Icon size={13} className="text-primary" />
        {title}
      </p>
      {items.length ? (
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it} className="flex items-start gap-2 text-sm text-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {it}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-subtle">Nothing yet — this week&apos;s the week!</p>
      )}
    </div>
  );
}

export function WeeklyReport({ report }: { report: WeeklyReportData }) {
  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-[var(--accent-mentor)] text-white">
          <SparklesIcon size={18} />
        </span>
        <div>
          <h2 className="text-base font-semibold tracking-tight">Weekly career report</h2>
          <p className="text-xs text-subtle">Your progress at a glance</p>
        </div>
      </div>

      <p className="rounded-xl border border-border bg-surface p-4 text-sm text-foreground/85">{report.summary}</p>

      <div className="grid gap-5 sm:grid-cols-2">
        <Block icon={AwardIcon} title="New achievements" items={report.newAchievements} />
        <Block icon={PuzzleIcon} title="Skills learned" items={report.skillsLearned} />
        <Block icon={CheckCircleIcon} title="AI recommendations" items={report.recommendations} />
        <Block icon={FlagIcon} title="Next week's goals" items={report.nextGoals} />
      </div>
    </Card>
  );
}
