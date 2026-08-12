"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  SparklesIcon,
  RouteIcon,
  ChartIcon,
  LightbulbIcon,
  TargetIcon,
  ClockIcon,
  CompassIcon,
  ArrowRightIcon,
} from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { analyzeSkillGap } from "../analysis";
import { saveSkillAssessmentAction } from "../actions";
import type { GapAnalysis, UserSkillInput } from "../types";
import type { SkillGapPageData, SavedAssessmentView } from "../queries";
import { SkillInput } from "./skill-input";
import { ReadinessRing } from "./readiness-ring";
import { SkillRadar } from "./skill-radar";
import { GapColumns } from "./gap-columns";
import { RecommendationCard } from "./recommendation-card";
import { ActionPlan } from "./action-plan";
import { HistoryPanel } from "./history-panel";

/**
 * Client orchestrator for the Skill Gap Analysis module.
 *
 * Owns the assessment state and toggles between the "assess" and "results"
 * phases. Analysis is computed entirely on the client via the pure
 * analyzeSkillGap() engine (the deterministic "placeholder AI"), using the
 * SkillGapCareer objects already present in pageData — the careers catalog is
 * never pulled into the client bundle. Saving is delegated to the server
 * action, which recomputes independently for integrity.
 */

type Phase = "assess" | "results";

interface SkillGapViewProps {
  data: SkillGapPageData;
}

export function SkillGapView({ data }: SkillGapViewProps) {
  const [phase, setPhase] = useState<Phase>("assess");
  const [selectedSlug, setSelectedSlug] = useState<string | null>(
    data.defaultCareerSlug,
  );
  const [userSkills, setUserSkills] = useState<UserSkillInput[]>(
    data.defaultSkills ?? [],
  );
  const [analysis, setAnalysis] = useState<GapAnalysis | null>(null);
  const [history, setHistory] = useState<SavedAssessmentView[]>(
    data.history ?? [],
  );
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [isSaving, startSaving] = useTransition();

  const selectedCareer = useMemo(
    () => data.careers.find((c) => c.slug === selectedSlug) ?? null,
    [data.careers, selectedSlug],
  );

  function handleAnalyze() {
    if (!selectedCareer || userSkills.length === 0) return;
    setAnalysis(analyzeSkillGap(selectedCareer, userSkills));
    setSaveState("idle");
    setPhase("results");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleReassess() {
    setPhase("assess");
    setSaveState("idle");
  }

  function handleSave() {
    if (!analysis || !selectedCareer) return;
    const career = selectedCareer;
    startSaving(async () => {
      const res = await saveSkillAssessmentAction({
        careerSlug: career.slug,
        skills: userSkills,
      });
      if (res.ok) {
        setHistory((prev) => [
          {
            id: res.id,
            careerSlug: career.slug,
            careerTitle: career.title,
            readinessScore: res.readinessScore,
            createdAtMs: Date.now(),
          },
          ...prev,
        ]);
        setSaveState("saved");
      } else {
        setSaveState("error");
      }
    });
  }

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* header */}
      <header className="animate-fade-up">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-primary">
          <SparklesIcon size={16} />
          Skill Gap Analysis
        </div>
        <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
          Find the gap between where you are and where you want to be
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
          Pick a target career, tell us what you already know, and get a
          personalized readiness score, learning plan, and step-by-step roadmap.
        </p>
      </header>

      {/* Non-blocking prerequisite notice — the tool below still works fully
          without Career Discovery, this just sets expectations that results
          are most personalized once a career direction exists. Reuses the
          same routes/copy as the dashboard's own Career Discovery / career
          matches prompts rather than inventing a new CTA. */}
      {data.readiness === "not-ready" && (
        <div className="mt-6 flex flex-col items-start gap-3 rounded-2xl border border-primary/20 bg-primary/[0.04] p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <CompassIcon size={18} />
            </span>
            <div>
              <p className="text-sm font-medium">
                {data.onboardingComplete
                  ? "Generate your career matches for a personalized starting point"
                  : "Complete Career Discovery for a personalized starting point"}
              </p>
              <p className="mt-0.5 text-xs text-muted">
                You can still run a Skill Gap analysis now — it&apos;ll just default to a general career until you have a direction.
              </p>
            </div>
          </div>
          <Link
            href={data.onboardingComplete ? ROUTES.recommendations : ROUTES.assessment}
            className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            {data.onboardingComplete ? "See matches" : "Start Career Discovery"}
            <ArrowRightIcon size={15} />
          </Link>
        </div>
      )}

      <div className="mt-8">
        {phase === "assess" || !analysis ? (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <SkillInput
              careers={data.careers}
              selectedSlug={selectedSlug}
              onSelectCareer={setSelectedSlug}
              userSkills={userSkills}
              onChangeSkills={setUserSkills}
              profileSkills={data.defaultSkills ?? []}
              onAnalyze={handleAnalyze}
            />
            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <ClockIcon size={16} className="text-primary" />
                Saved assessments
              </div>
              <HistoryPanel history={history} />
            </aside>
          </div>
        ) : (
          <ResultsView
            analysis={analysis}
            history={history}
            onReassess={handleReassess}
            onSave={handleSave}
            isSaving={isSaving}
            saveState={saveState}
          />
        )}
      </div>
    </div>
  );
}

interface ResultsViewProps {
  analysis: GapAnalysis;
  history: SavedAssessmentView[];
  onReassess: () => void;
  onSave: () => void;
  isSaving: boolean;
  saveState: "idle" | "saved" | "error";
}

function ResultsView({
  analysis,
  history,
  onReassess,
  onSave,
  isSaving,
  saveState,
}: ResultsViewProps) {
  return (
    <div className="animate-fade-up space-y-8">
      {/* top bar: title + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {analysis.careerTitle}
          </h2>
          <p className="text-sm text-muted">
            Based on {analysis.totalRequired} required skills for this role.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={onReassess}>
            Edit skills
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onSave}
            isLoading={isSaving}
            disabled={isSaving || saveState === "saved"}
          >
            {saveState === "saved" ? "Saved ✓" : "Save progress"}
          </Button>
        </div>
      </div>

      {saveState === "error" && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          Couldn&apos;t save your assessment. Please try again in a moment.
        </p>
      )}

      {/* readiness + radar */}
      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <Card className="flex flex-col items-center justify-center">
          <ReadinessRing value={analysis.readinessScore} size={148} />
          <div className="mt-5 grid w-full grid-cols-3 gap-2 text-center">
            <Stat label="Mastered" value={analysis.mastered.length} tone="success" />
            <Stat label="Partial" value={analysis.partial.length} tone="warning" />
            <Stat label="Missing" value={analysis.missing.length} tone="danger" />
          </div>
        </Card>
        <Card>
          <div className="mb-4 flex items-center gap-2">
            <ChartIcon size={16} className="text-primary" />
            <h3 className="text-sm font-semibold">Skills by category</h3>
          </div>
          <SkillRadar categories={analysis.categories} />
        </Card>
      </div>

      {/* gap columns */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <TargetIcon size={16} className="text-primary" />
          <h3 className="text-sm font-semibold">Where you stand</h3>
        </div>
        <GapColumns analysis={analysis} />
      </section>

      {/* recommendations */}
      {analysis.recommendations.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <LightbulbIcon size={16} className="text-primary" />
            <h3 className="text-sm font-semibold">Learning recommendations</h3>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {analysis.recommendations.map((rec) => (
              <RecommendationCard key={rec.skill} rec={rec} />
            ))}
          </div>
        </section>
      )}

      {/* action plan */}
      {analysis.actionPlan.length > 0 && (
        <section>
          <div className="mb-3 flex items-center gap-2">
            <RouteIcon size={16} className="text-primary" />
            <h3 className="text-sm font-semibold">
              Your personalized action plan
            </h3>
          </div>
          <ActionPlan stages={analysis.actionPlan} />
        </section>
      )}

      {/* history */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <ClockIcon size={16} className="text-primary" />
          <h3 className="text-sm font-semibold">Progress over time</h3>
        </div>
        <HistoryPanel history={history} />
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "success" | "warning" | "danger";
}) {
  const color =
    tone === "success"
      ? "var(--success)"
      : tone === "warning"
        ? "var(--warning)"
        : "var(--danger)";
  return (
    <div className="rounded-xl border border-border bg-surface px-2 py-3">
      <div className="text-lg font-bold tabular-nums" style={{ color }}>
        {value}
      </div>
      <div className="text-[11px] font-medium text-muted">{label}</div>
    </div>
  );
}
