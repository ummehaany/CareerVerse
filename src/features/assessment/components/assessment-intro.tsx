"use client";

import Link from "next/link";
import type { AssessmentDraftView } from "../types";
import { SECTIONS, TOTAL_QUESTIONS, ESTIMATED_MINUTES } from "../questions";
import { computeProgress } from "../validation";
import { OptionIcon } from "./option-icon";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ClockIcon, LayersIcon, CheckCircleIcon, ShieldIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";

export function AssessmentIntro({
  draft,
  hasCompleted,
  onStart,
}: {
  draft: AssessmentDraftView | null;
  hasCompleted: boolean;
  onStart: (resume: boolean) => void;
}) {
  const resumeProgress = draft ? computeProgress(draft.answers) : 0;

  return (
    <div className="mx-auto max-w-3xl">
      <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 sm:p-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          Career Assessment
        </span>
        <h1 className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">
          Let&apos;s map your career direction
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">
          A quick, thoughtful set of questions about your interests, skills, and goals. Your answers
          build the profile that will power every recommendation, roadmap, and interview plan to come.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted">
            <LayersIcon size={16} /> {TOTAL_QUESTIONS} questions
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted">
            <ClockIcon size={16} /> ~{ESTIMATED_MINUTES} minutes
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted">
            <ShieldIcon size={16} /> Saves automatically
          </span>
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          {draft ? (
            <>
              <Button size="lg" onClick={() => onStart(true)}>
                Resume assessment
                <ArrowRightIcon size={18} />
              </Button>
              <Button size="lg" variant="outline" onClick={() => onStart(false)}>
                Start over
              </Button>
              <span className="text-sm text-subtle">You&apos;re {resumeProgress}% through.</span>
            </>
          ) : hasCompleted ? (
            <>
              <Button size="lg" onClick={() => onStart(false)}>
                Retake assessment
                <ArrowRightIcon size={18} />
              </Button>
              <Link
                href={ROUTES.dashboard}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-md border border-foreground/15 px-6 text-base font-medium transition-colors hover:bg-foreground/5"
              >
                Back to dashboard
              </Link>
            </>
          ) : (
            <Button size="lg" onClick={() => onStart(false)}>
              Start assessment
              <ArrowRightIcon size={18} />
            </Button>
          )}
        </div>

        {hasCompleted && !draft && (
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-success">
            <CheckCircleIcon size={16} /> You&apos;ve completed this before — retaking will refresh your profile.
          </p>
        )}
      </section>

      <div className="mt-6">
        <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-subtle">
          What we&apos;ll cover
        </h2>
        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {SECTIONS.map((section, index) => (
            <div
              key={section.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-background p-3.5"
            >
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                <OptionIcon name={section.icon} size={18} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">
                  <span className="text-subtle tabular-nums">{index + 1}. </span>
                  {section.title}
                </p>
                <p className="truncate text-xs text-muted">{section.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
