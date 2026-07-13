"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { CareerRecommendation } from "@/types/recommendation";
import { generateRoadmapAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  CompassIcon,
  SparklesIcon,
  ArrowRightIcon,
  RouteIcon,
  DollarIcon,
  TrendingUpIcon,
} from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";

function formatSalary(salary: CareerRecommendation["salaryRange"]): string {
  const symbol = salary.currency === "USD" ? "$" : "";
  const prefix = symbol ? symbol : `${salary.currency} `;
  const min = salary.min.toLocaleString("en-US");
  const max = salary.max.toLocaleString("en-US");
  const period = salary.period.toLowerCase().startsWith("year")
    ? "yr"
    : salary.period.toLowerCase().startsWith("month")
      ? "mo"
      : salary.period;
  return `${prefix}${min} – ${prefix}${max} / ${period}`;
}

export function RoadmapListView({
  hasCompletedAssessment,
  recommendations,
  aiConfigured,
}: {
  hasCompletedAssessment: boolean;
  recommendations: CareerRecommendation[] | null;
  aiConfigured: boolean;
}) {
  const router = useRouter();
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleBuildRoadmap(careerTitle: string) {
    setGeneratingFor(careerTitle);
    setError(null);
    const result = await generateRoadmapAction(careerTitle);
    if (result.ok) {
      router.push(`/roadmap/${result.id}`);
      router.refresh();
    } else {
      setError(result.error);
      setGeneratingFor(null);
    }
  }

  // 1) Assessment not completed yet
  if (!hasCompletedAssessment) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Learning Roadmap</h1>
          <p className="max-w-xl text-sm text-muted">
            Generate a personalized, milestone-based guide to gain the skills required for your target role.
          </p>
        </div>
        <Card className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <CompassIcon size={28} />
          </span>
          <div className="space-y-1">
            <p className="font-medium">Complete your career assessment first</p>
            <p className="mx-auto max-w-md text-sm text-muted">
              We need your career assessment profile to tailor a roadmap for your background, interests, and target roles.
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

  // 2) Generating in progress
  if (generatingFor) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Building Roadmap</h1>
          <p className="max-w-xl text-sm text-muted">
            Personalizing your path to becoming a {generatingFor}…
          </p>
        </div>
        <Card className="flex flex-col items-center justify-center gap-6 py-20 text-center">
          <Spinner className="h-10 w-10 text-primary" />
          <div className="space-y-2">
            <p className="font-semibold text-lg">Designing your milestones & resources</p>
            <p className="mx-auto max-w-md text-sm text-muted">
              Gemini is creating a custom learning plan, listing relevant skills, and attaching high-quality learning resources. This will take a few moments.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  // 3) Assessment complete, but matches have not been generated yet
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Learning Roadmap</h1>
          <p className="max-w-xl text-sm text-muted">
            Generate a personalized, milestone-based guide to gain the skills required for your target role.
          </p>
        </div>
        {!aiConfigured && (
          <Alert variant="info">
            AI isn&apos;t configured yet. Add a <span className="font-medium">GEMINI_API_KEY</span> to
            your environment to enable recommendations and roadmaps.
          </Alert>
        )}
        {error && <Alert variant="error">{error}</Alert>}
        <Card className="flex flex-col items-center gap-4 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <SparklesIcon size={28} />
          </span>
          <div className="space-y-1">
            <p className="font-medium">Generate your career matches first</p>
            <p className="mx-auto max-w-md text-sm text-muted">
              We build your roadmaps using the roles matched to your assessment. Go to Career Matches to discover your paths.
            </p>
          </div>
          <Link
            href={ROUTES.recommendations}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            Find career matches
            <ArrowRightIcon size={16} />
          </Link>
        </Card>
      </div>
    );
  }

  // 4) Success: List recommended careers so the user can build roadmaps for them
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Learning Roadmap</h1>
        <p className="max-w-xl text-sm text-muted">
          Select one of your career matches to generate a step-by-step personalized learning path.
        </p>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="grid gap-4">
        {recommendations.map((rec, index) => (
          <Card
            key={`${rec.title}-${index}`}
            className="flex flex-col justify-between sm:flex-row sm:items-center gap-4 p-5 hover:border-foreground/20 transition-all hover:shadow-sm"
          >
            <div className="space-y-1.5 max-w-xl">
              <h3 className="font-semibold text-lg leading-snug">{rec.title}</h3>
              <p className="text-sm text-muted line-clamp-2">{rec.overview}</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                <span className="inline-flex items-center gap-1">
                  <DollarIcon size={14} className="text-subtle" />
                  {formatSalary(rec.salaryRange)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <TrendingUpIcon size={14} className="text-subtle" />
                  {rec.industryGrowth.outlook} growth
                </span>
              </div>
            </div>
            <div className="shrink-0 flex items-center">
              <Button onClick={() => handleBuildRoadmap(rec.title)} size="sm" className="w-full sm:w-auto">
                <RouteIcon size={15} />
                Build roadmap
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
