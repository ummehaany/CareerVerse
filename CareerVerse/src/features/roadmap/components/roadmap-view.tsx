"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RoadmapPageData } from "../queries";
import type { RoadmapView as RoadmapViewModel } from "../types";
import { useRoadmapProgress } from "../hooks/use-roadmap-progress";
import { generateRoadmap } from "../actions";
import { CareerPicker } from "./career-picker";
import { RoadmapHeader } from "./roadmap-header";
import { StageSection } from "./stage-section";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CompassIcon, TargetIcon, ArrowRightIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";

function PageIntro() {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">Learning Roadmap</h1>
      <p className="max-w-xl text-sm text-muted">
        A personalized, stage-by-stage path to your target career.
      </p>
    </div>
  );
}

function GeneratingPanel() {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Spinner className="h-8 w-8 text-primary" />
      <div className="space-y-1">
        <p className="font-medium">Building your roadmap…</p>
        <p className="mx-auto max-w-sm text-sm text-muted">
          We&apos;re mapping out beginner, intermediate, and advanced stages tailored to you. This
          takes a few moments.
        </p>
      </div>
    </Card>
  );
}

function EmptyPrompt({
  icon,
  title,
  body,
  href,
  cta,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="flex flex-col items-center gap-4 py-14 text-center">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        <p className="mx-auto max-w-md text-sm text-muted">{body}</p>
      </div>
      <Link
        href={href}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
      >
        {cta}
        <ArrowRightIcon size={16} />
      </Link>
    </Card>
  );
}

/** Renders an existing roadmap with progress tracking (hooks live here). */
function RoadmapContent({
  roadmap,
  onNew,
}: {
  roadmap: RoadmapViewModel;
  onNew: () => void;
}) {
  const totalMilestones = roadmap.stages.reduce((sum, stage) => sum + stage.milestones.length, 0);
  const { toggle, isCompleted, completedCount, percent, error } = useRoadmapProgress(
    roadmap.id,
    roadmap.progress,
    totalMilestones,
  );

  return (
    <div className="space-y-6">
      <RoadmapHeader
        careerTitle={roadmap.careerTitle}
        overview={roadmap.overview}
        totalEstimatedTime={roadmap.totalEstimatedTime}
        percent={percent}
        completedCount={completedCount}
        totalMilestones={totalMilestones}
        onNew={onNew}
      />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="space-y-8">
        {roadmap.stages.map((stage, index) => (
          <StageSection
            key={`${stage.level}-${index}`}
            stage={stage}
            index={index}
            isCompleted={isCompleted}
            onToggle={toggle}
          />
        ))}
      </div>
    </div>
  );
}

export function RoadmapView({ data }: { data: RoadmapPageData }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [picking, setPicking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(careerTitle: string) {
    setGenerating(true);
    setError(null);
    const result = await generateRoadmap({ careerTitle });
    if (result.ok) {
      setPicking(false);
      router.refresh();
      setTimeout(() => setGenerating(false), 400);
    } else {
      setError(result.error);
      setGenerating(false);
    }
  }

  // 1) No completed assessment.
  if (!data.hasCompletedAssessment) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageIntro />
        <EmptyPrompt
          icon={<CompassIcon size={28} />}
          title="Take your career assessment first"
          body="Your roadmap is built from your assessment so it fits your current level and goals."
          href={ROUTES.assessment}
          cta="Start assessment"
        />
      </div>
    );
  }

  // 2) No recommendations to target yet.
  if (data.careerOptions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageIntro />
        <EmptyPrompt
          icon={<TargetIcon size={28} />}
          title="Generate your career matches first"
          body="Pick one of your recommended careers to build a roadmap toward. Generate them on the Career Matches page."
          href={ROUTES.recommendations}
          cta="View career matches"
        />
      </div>
    );
  }

  // 3) Generating.
  if (generating) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageIntro />
        <GeneratingPanel />
      </div>
    );
  }

  // 4) Existing roadmap.
  if (data.roadmap && !picking) {
    return (
      <div className="mx-auto max-w-3xl">
        <RoadmapContent roadmap={data.roadmap} onNew={() => setPicking(true)} />
      </div>
    );
  }

  // 5) Pick a career and generate.
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageIntro />
      {!data.aiConfigured && (
        <Alert variant="info">
          AI isn&apos;t configured yet. Add a <span className="font-medium">GEMINI_API_KEY</span> to
          your environment to generate roadmaps.
        </Alert>
      )}
      {error && <Alert variant="error">{error}</Alert>}
      <CareerPicker options={data.careerOptions} onGenerate={handleGenerate} generating={generating} />
      {data.roadmap && (
        <div className="text-center">
          <Button variant="ghost" onClick={() => setPicking(false)}>
            Back to current roadmap
          </Button>
        </div>
      )}
    </div>
  );
}
