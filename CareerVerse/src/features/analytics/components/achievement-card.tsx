"use client";

import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import {
  CompassIcon,
  TargetIcon,
  FileTextIcon,
  MicIcon,
  PuzzleIcon,
  RocketIcon,
  RouteIcon,
  SparklesIcon,
  TrendingUpIcon,
  CheckIcon,
} from "@/components/ui/icon";
import { AwardIcon, StarIcon } from "@/components/ui/icons-extended";
import type { AchievementView } from "../types";

export const ACHIEVEMENT_ICONS: Record<string, ComponentType<IconProps>> = {
  compass: CompassIcon,
  target: TargetIcon,
  file: FileTextIcon,
  mic: MicIcon,
  puzzle: PuzzleIcon,
  rocket: RocketIcon,
  route: RouteIcon,
  sparkles: SparklesIcon,
  award: AwardIcon,
  flame: TrendingUpIcon,
  trophy: StarIcon,
};

export function AchievementCard({ achievement }: { achievement: AchievementView }) {
  const Icon = ACHIEVEMENT_ICONS[achievement.icon] ?? AwardIcon;
  const unlocked = achievement.unlocked;

  return (
    <div
      className={
        "relative flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-all " +
        (unlocked
          ? "border-border bg-background hover:-translate-y-0.5 hover:shadow-md"
          : "border-dashed border-border bg-surface")
      }
    >
      {unlocked && (
        <span className="absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full bg-success text-white">
          <CheckIcon size={12} />
        </span>
      )}
      <span
        className="grid h-12 w-12 place-items-center rounded-2xl"
        style={
          unlocked
            ? { background: `color-mix(in srgb, var(${achievement.accentVar}) 16%, transparent)`, color: `var(${achievement.accentVar})` }
            : { background: "color-mix(in srgb, var(--foreground) 6%, transparent)", color: "var(--subtle)" }
        }
      >
        <Icon size={22} />
      </span>
      <div className="space-y-0.5">
        <p className={"text-sm font-semibold " + (unlocked ? "" : "text-muted")}>{achievement.title}</p>
        <p className="text-xs text-subtle">{achievement.description}</p>
      </div>
      <span
        className={
          "mt-auto rounded-full px-2 py-0.5 text-[11px] font-semibold " +
          (unlocked ? "bg-primary/10 text-primary" : "bg-foreground/[0.04] text-subtle")
        }
      >
        {unlocked ? `+${achievement.xp} XP` : "Locked"}
      </span>
    </div>
  );
}
