"use client";

import { Card } from "@/components/ui/card";
import type { IconProps } from "@/components/ui/icon";
import {
  ChatIcon,
  UsersIcon,
  CodeIcon,
  PuzzleIcon,
  TargetIcon,
  FlagIcon,
  HeartIcon,
  MicIcon,
  LightbulbIcon,
} from "@/components/ui/icon";
import type { ComponentType } from "react";
import type { InterviewKit } from "../types";

const ICONS: Record<string, ComponentType<IconProps>> = {
  chat: ChatIcon,
  users: UsersIcon,
  code: CodeIcon,
  puzzle: PuzzleIcon,
  target: TargetIcon,
  flag: FlagIcon,
  heart: HeartIcon,
};

export function InterviewSection({
  kit,
  companyName,
}: {
  kit: InterviewKit;
  companyName: string;
}) {
  return (
    <div className="space-y-5">
      <Card className="flex items-start gap-2 bg-surface">
        <MicIcon size={18} className="mt-0.5 shrink-0 text-primary" />
        <div>
          <h2 className="text-base font-semibold tracking-tight">
            {companyName} interview prep — {kit.roleTitle}
          </h2>
          <p className="text-sm text-muted">
            Company-tailored questions across every round. Practice out loud, then run a full session in Mock Interviews.
          </p>
        </div>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {kit.groups.map((group) => {
          const Icon = ICONS[group.icon] ?? ChatIcon;
          return (
            <Card key={group.category} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon size={16} />
                </span>
                <h3 className="text-sm font-semibold tracking-tight">{group.category}</h3>
              </div>
              <ul className="space-y-2">
                {group.questions.map((q, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground/85">
                    <span className="mt-0.5 text-xs font-semibold text-subtle tabular-nums">{i + 1}.</span>
                    {q}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <LightbulbIcon size={16} className="text-primary" />
          <h3 className="text-sm font-semibold tracking-tight">Preparation tips</h3>
        </div>
        <ul className="space-y-1.5">
          {kit.tips.map((t) => (
            <li key={t} className="flex items-start gap-2 text-sm text-muted">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {t}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
