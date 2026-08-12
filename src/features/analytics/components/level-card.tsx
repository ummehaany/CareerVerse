"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SparklesIcon } from "@/components/ui/icon";
import type { LevelInfo, XpSource } from "../types";
import { ProgressRing } from "./progress-ring";

export function LevelCard({ level, sources }: { level: LevelInfo; sources: XpSource[] }) {
  const pct = level.xpForLevel > 0 ? (level.xpIntoLevel / level.xpForLevel) * 100 : 0;

  return (
    <Card
      className="relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, color-mix(in srgb, var(--primary) 16%, var(--background)) 0%, var(--background) 62%)",
      }}
    >
      <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-6">
        <ProgressRing value={pct} size={132} color="var(--primary)">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-subtle">Level</span>
          <span className="text-3xl font-bold leading-none tabular-nums">{level.level}</span>
        </ProgressRing>

        <div className="flex-1 space-y-3 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center gap-2 sm:justify-start">
              <SparklesIcon size={18} className="text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">{level.title}</h2>
            </div>
            <p className="text-sm text-muted">
              {level.totalXp.toLocaleString()} total XP · Next: {level.nextMilestone}
            </p>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted">
              <span>Progress to next level</span>
              <span className="font-medium tabular-nums">
                {level.xpIntoLevel} / {level.xpForLevel} XP
              </span>
            </div>
            <Progress value={pct} />
            <p className="text-xs text-subtle">{level.xpToNext} XP to reach {level.nextMilestone}</p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {sources.map((s) => (
          <div key={s.label} className="rounded-lg border border-border bg-background/70 p-2.5 text-center backdrop-blur-sm">
            <p className="text-base font-bold tabular-nums text-primary">{s.xp}</p>
            <p className="text-[11px] text-muted">{s.label}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
