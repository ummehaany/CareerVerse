"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { RecommendationsPageData } from "../queries";
import { generateRecommendations } from "../actions";
import { RecommendationCard } from "./recommendation-card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  SparklesIcon,
  CompassIcon,
  ArrowRightIcon,
  TargetIcon,
} from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";

function PageIntro({ children }: { children?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Career Matches</h1>
        <p className="max-w-xl text-sm text-muted">
          Your Top 5 career paths, matched to your assessment.
        </p>
      </div>
      {children}
    </div>
  );
}

function GeneratingPanel() {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <Spinner className="h-8 w-8 text-primary" />
      <div className="space-y-1">
        <p className="font-medium">Analyzing your profile…</p>
        <p className="mx-auto max-w-sm text-sm text-muted">
          We&apos;re matching your interests, skills, and goals against career paths. This takes a few
          moments.
        </p>
      </div>
    </Card>
  );
}

export function RecommendationsView({ data }: { data: RecommendationsPageData }) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const result = await generateRecommendations();
    if (result.ok) {
      router.refresh();
      // Leave the panel up briefly; the refreshed server data replaces it.
      setTimeout(() => setGenerating(false), 400);
    } else {
      setError(result.error);
      setGenerating(false);
    }
  }

  // 1) No completed assessment yet.
  if (!data.hasCompletedAssessment) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageIntro />
        <Card className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CompassIcon size={28} />
          </span>
          <div className="space-y-1">
            <p className="font-medium">Take your career assessment first</p>
            <p className="mx-auto max-w-md text-sm text-muted">
              Your recommendations are generated from your assessment answers. It only takes a few
              minutes.
            </p>
          </div>
          <Link
            href={ROUTES.assessment}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Start assessment
            <ArrowRightIcon size={16} />
          </Link>
        </Card>
      </div>
    );
  }

  // 2) Assessment done, generating in progress.
  if (generating) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageIntro />
        <GeneratingPanel />
      </div>
    );
  }

  // 3) Assessment done, nothing generated yet.
  if (!data.recommendations) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <PageIntro />
        {error && <Alert variant="error">{error}</Alert>}
        <Card className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <SparklesIcon size={28} />
          </span>
          <div className="space-y-1">
            <p className="font-medium">Generate your career matches</p>
            <p className="mx-auto max-w-md text-sm text-muted">
              We&apos;ll analyze your assessment and suggest the five careers that fit you best — with
              match scores, salary ranges, and next steps.
            </p>
          </div>
          <Button size="lg" onClick={handleGenerate}>
            <SparklesIcon size={18} />
            Generate recommendations
          </Button>
        </Card>
      </div>
    );
  }

  // 4) Results.
  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <PageIntro>
        <div className="flex items-center gap-2">
          {data.source === "fallback" && <Badge variant="warning">Offline Recommendation</Badge>}
          <Button variant="outline" onClick={handleGenerate}>
            <SparklesIcon size={16} />
            Regenerate
          </Button>
        </div>
      </PageIntro>

      {error && <Alert variant="error">{error}</Alert>}

      {data.source === "fallback" && (
        <Alert variant="info">
          These matches were generated instantly from CareerVerse&apos;s own career database.
          Regenerate anytime for AI-personalized insights.
        </Alert>
      )}

      {data.isStale && (
        <Alert variant="info">
          You&apos;ve retaken your assessment since these were generated. Regenerate for updated
          matches.
        </Alert>
      )}

      <div className="flex items-center gap-2 text-sm text-muted">
        <TargetIcon size={16} className="text-primary" />
        {data.recommendations.length} personalized matches, ranked by fit.
      </div>

      <div className="space-y-4">
        {data.recommendations.map((recommendation, index) => (
          <RecommendationCard
            key={`${recommendation.title}-${index}`}
            recommendation={recommendation}
            rank={index + 1}
            defaultOpen={index === 0}
          />
        ))}
      </div>
    </div>
  );
}
