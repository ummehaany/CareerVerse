"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Career } from "@/lib/careers/types";
import { computeSkillGap } from "../analysis";
import { updateSkillProgress } from "../actions";
import { Progress } from "@/components/ui/progress";
import { CheckIcon, ClockIcon, RouteIcon, TargetIcon } from "@/components/ui/icon";
import { ExternalLinkIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export function SkillGap({
  careerSlug,
  career,
  userSkills,
  initialLearned = [],
}: {
  careerSlug: string;
  career: Career;
  userSkills: string[];
  initialLearned?: string[];
}) {
  const gap = useMemo(() => computeSkillGap(userSkills, career), [userSkills, career]);
  const missingSkills = useMemo(() => gap.missing.map((m) => m.skill), [gap.missing]);

  const [learned, setLearned] = useState<Set<string>>(
    () => new Set(initialLearned.filter((s) => missingSkills.includes(s))),
  );

  if (userSkills.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border p-5 text-sm text-muted">
        Complete your{" "}
        <Link href={ROUTES.assessment} className="font-medium text-primary hover:underline">
          career assessment
        </Link>{" "}
        to see how your skills compare with this role.
      </div>
    );
  }

  const total = career.skills.length;
  const readiness = total ? Math.round(((gap.have.length + learned.size) / total) * 100) : 0;

  async function toggleLearned(skill: string) {
    const next = new Set(learned);
    if (next.has(skill)) next.delete(skill);
    else next.add(skill);
    setLearned(next);
    await updateSkillProgress({ careerSlug, learned: Array.from(next) });
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Overall readiness</span>
          <span className="font-semibold tabular-nums">{readiness}%</span>
        </div>
        <Progress value={readiness} label="Career readiness" />
        <p className="text-xs text-subtle">
          Based on {gap.have.length} skills you have and {learned.size} you&apos;ve marked as learned,
          out of {total}.
        </p>
      </div>

      {gap.have.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Skills you already have</p>
          <div className="flex flex-wrap gap-1.5">
            {gap.have.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 rounded-full border border-success/30 bg-success/10 px-2.5 py-1 text-xs font-medium text-success"
              >
                <CheckIcon size={12} />
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {gap.missing.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold">Skills to build (priority order)</p>
          <ul className="space-y-2">
            {gap.missing.map((item, index) => {
              const isLearned = learned.has(item.skill);
              return (
                <li
                  key={item.skill}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-2 rounded-lg border p-3 transition-colors",
                    isLearned ? "border-success/30 bg-success/[0.04]" : "border-border",
                  )}
                >
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleLearned(item.skill)}
                      aria-pressed={isLearned}
                      aria-label={isLearned ? `Mark ${item.skill} not learned` : `Mark ${item.skill} learned`}
                      className={cn(
                        "grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
                        isLearned
                          ? "border-success bg-success text-white"
                          : "border-foreground/25 text-transparent hover:border-primary",
                      )}
                    >
                      <CheckIcon size={13} />
                    </button>
                    <span className={cn("text-sm font-medium", isLearned && "text-muted line-through")}>
                      {index + 1}. {item.skill}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-subtle">
                    <span className="inline-flex items-center gap-1">
                      <ClockIcon size={13} />~{item.estWeeks} wks
                    </span>
                    {item.resource && (
                      <a
                        href={item.resource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
                      >
                        {item.resource.title}
                        <ExternalLinkIcon size={12} />
                      </a>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {gap.missing.length === 0 && (
        <p className="text-sm text-success">You already have all the core skills for this role.</p>
      )}

      <div className="flex flex-wrap gap-2 border-t border-border pt-4">
        <Link
          href={ROUTES.roadmap}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <RouteIcon size={15} />
          Build a learning roadmap
        </Link>
        <Link
          href={ROUTES.recommendations}
          className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-muted transition-colors hover:bg-foreground/5"
        >
          <TargetIcon size={15} />
          See career matches
        </Link>
      </div>
    </div>
  );
}
