"use client";

import { useEffect, useMemo, useState } from "react";
import type { AchievementsData } from "../queries";
import { ACHIEVEMENTS, levelForXp } from "../config";
import { pingActivityAction } from "../actions";
import { SectionHeading } from "@/components/shared/state-panels";
import { Progress } from "@/components/ui/progress";
import { CheckIcon } from "@/components/ui/icon";
import { StarIcon } from "@/components/ui/icons-extended";
import { cn } from "@/lib/utils";

export function AchievementsView({ data }: { data: AchievementsData }) {
  const [streak, setStreak] = useState(data.streak);
  const [longestStreak, setLongestStreak] = useState(data.longestStreak);

  useEffect(() => {
    let active = true;
    pingActivityAction().then((result) => {
      if (active && result.ok) {
        setStreak(result.streak);
        setLongestStreak(result.longestStreak);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const { earned, totalXp, level } = useMemo(() => {
    const earnedSet = ACHIEVEMENTS.filter((a) => a.check(data.snapshot));
    const xp = earnedSet.reduce((sum, a) => sum + a.xp, 0);
    return { earned: new Set(earnedSet.map((a) => a.id)), totalXp: xp, level: levelForXp(xp) };
  }, [data.snapshot]);

  const levelPercent = Math.min(100, Math.round((level.intoLevel / level.span) * 100));

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <SectionHeading
        title="Achievements"
        description="Earn XP and badges as you make progress on your career journey."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-5 sm:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-subtle">Level</p>
              <p className="text-3xl font-bold tabular-nums">{level.level}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-subtle">Total XP</p>
              <p className="text-lg font-semibold tabular-nums">{totalXp}</p>
            </div>
          </div>
          <div className="mt-4 space-y-1.5">
            <Progress value={levelPercent} label="Progress to next level" />
            <p className="text-xs text-subtle">
              {level.nextAt !== null
                ? `${level.span - level.intoLevel} XP to level ${level.level + 1}`
                : "Max level reached"}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-subtle">
            <StarIcon size={14} className="text-warning" />
            Streak
          </p>
          <p className="mt-1 text-3xl font-bold tabular-nums">
            {streak}
            <span className="ml-1 text-sm font-medium text-subtle">days</span>
          </p>
          <p className="mt-1 text-xs text-subtle">Longest: {longestStreak} days</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">
          Badges ({earned.size}/{ACHIEVEMENTS.length})
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((achievement) => {
            const Icon = achievement.icon;
            const unlocked = earned.has(achievement.id);
            return (
              <div
                key={achievement.id}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-4 transition-colors",
                  unlocked ? "border-border bg-background" : "border-dashed border-border bg-transparent opacity-70",
                )}
              >
                <span
                  className={cn(
                    "grid h-11 w-11 shrink-0 place-items-center rounded-xl",
                    unlocked ? "bg-primary/10 text-primary" : "bg-foreground/5 text-subtle",
                  )}
                >
                  <Icon size={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="truncate text-sm font-semibold">{achievement.title}</p>
                    {unlocked && <CheckIcon size={14} className="shrink-0 text-success" />}
                  </div>
                  <p className="truncate text-xs text-muted">{achievement.description}</p>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold",
                    unlocked ? "bg-primary/10 text-primary" : "bg-foreground/5 text-subtle",
                  )}
                >
                  +{achievement.xp}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
