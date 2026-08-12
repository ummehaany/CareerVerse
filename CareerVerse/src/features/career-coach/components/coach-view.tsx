"use client";

import { useState, type FormEvent } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { SparklesIcon, ArrowRightIcon, ChevronLeftIcon, CompassIcon, ClockIcon } from "@/components/ui/icon";
import type { CoachHomeData } from "../types";
import { SUGGESTED_GOALS } from "../plan-catalog";
import { generateCareerPlanAction } from "../actions";
import type { CareerPlan } from "../plan-types";
import { CareerReport, ReportSkeleton } from "./career-report";
import { openUpgradeDialog } from "@/features/subscription/events";

export function CoachView({ data }: { data: CoachHomeData }) {
  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState<CareerPlan | null>(null);
  const [aiUsed, setAiUsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recent goals from saved report history (deduped by title).
  const recent = Array.from(new Set(data.conversations.map((c) => c.title).filter(Boolean))).slice(0, 5);

  async function run(goalText: string) {
    const g = goalText.trim();
    if (!g || loading) return;
    setLoading(true);
    setError(null);
    setPlan(null);
    const res = await generateCareerPlanAction({ goal: g });
    setLoading(false);
    if (res.ok) {
      setPlan(res.plan);
      setAiUsed(res.aiUsed);
      if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
    } else if (res.limitReached) {
      openUpgradeDialog(res.feature);
    } else {
      setError(res.error);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void run(goal);
  }

  function reset() {
    setPlan(null);
    setError(null);
    setGoal("");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <PageHeader
        title="Career Planning Engine"
        description="Get an instant, AI-guided plan for any career goal — great for exploring options. This is planning guidance, separate from your official CareerVerse Roadmap."
      />

      {/* Result */}
      {plan ? (
        <div className="space-y-4">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-foreground"
          >
            <ChevronLeftIcon size={16} /> New career plan
          </button>
          <CareerReport plan={plan} aiUsed={aiUsed} />
        </div>
      ) : loading ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-muted">
            <SparklesIcon size={16} className="animate-pulse text-primary" />
            Building your personalized career plan…
          </div>
          <ReportSkeleton />
        </div>
      ) : (
        <>
          {/* Hero input */}
          <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/[0.08] via-background to-background p-6 sm:p-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <SparklesIcon size={14} /> AI Career Planning
            </span>
            <h2 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">
              What do you want to become?
            </h2>
            <p className="mt-2 max-w-lg text-sm text-muted">
              Tell the coach your goal — like &ldquo;I want to become a Data Scientist&rdquo; — and get an
              instant exploration plan: skills, a suggested month-by-month learning path, projects,
              courses, salary insights, interview prep, and a weekly action plan.
            </p>
            <p className="mt-2 max-w-lg text-xs text-subtle">
              This is planning guidance to help you explore and think through a direction — it doesn&apos;t
              create or update your official CareerVerse Roadmap, Timeline, or Achievements. Build your
              trackable roadmap any time from the Roadmap page.
            </p>

            <form onSubmit={onSubmit} className="mt-5 flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <CompassIcon size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
                <input
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="I want to become a…"
                  aria-label="Career goal"
                  className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none transition-colors focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <button
                type="submit"
                disabled={!goal.trim()}
                className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                Generate plan
                <ArrowRightIcon size={16} />
              </button>
            </form>

            {error && <p className="mt-3 text-sm text-danger">{error}</p>}
            {!data.aiConfigured && (
              <p className="mt-3 text-xs text-subtle">
                Tip: add an AI key to enable richer, AI-generated plans. A complete curated plan is
                always available instantly.
              </p>
            )}
          </section>

          {/* Suggested goals */}
          <section className="space-y-2.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Popular goals</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTED_GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => run(g)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-1.5 text-sm font-medium transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary"
                >
                  <SparklesIcon size={13} className="text-primary" /> {g}
                </button>
              ))}
            </div>
          </section>

          {/* Recent plans */}
          {recent.length > 0 && (
            <section className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Your recent plans</p>
              <div className="flex flex-wrap gap-2">
                {recent.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => run(r)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <ClockIcon size={12} /> {r}
                  </button>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
