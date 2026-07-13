"use client";

import { useState, type ReactNode } from "react";
import type { CareerInsights } from "@/lib/careers/types";
import { generateCareerInsightsAction } from "../actions";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import { SparklesIcon, RocketIcon, ChevronRightIcon } from "@/components/ui/icon";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      {children}
    </div>
  );
}

export function CareerInsightsPanel({
  slug,
  initialInsights,
  aiConfigured,
}: {
  slug: string;
  initialInsights: CareerInsights | null;
  aiConfigured: boolean;
}) {
  const [insights, setInsights] = useState<CareerInsights | null>(initialInsights);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    const result = await generateCareerInsightsAction(slug);
    setLoading(false);
    if (result.ok) setInsights(result.insights);
    else setError(result.error);
  }

  if (!insights) {
    return (
      <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <SparklesIcon size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold tracking-tight">AI career insights</h2>
            <p className="mt-0.5 text-sm text-muted">
              Generate a day-in-the-life, insider tips, recommended projects, and a learning path for
              this career.
            </p>
            {!aiConfigured && (
              <p className="mt-2 text-xs text-subtle">
                AI isn&apos;t configured yet — add a GEMINI_API_KEY to enable insights.
              </p>
            )}
            {error && (
              <div className="mt-3">
                <Alert variant="error">{error}</Alert>
              </div>
            )}
            <div className="mt-4">
              {loading ? (
                <span className="inline-flex items-center gap-2 text-sm text-muted">
                  <Spinner className="h-4 w-4 text-primary" />
                  Generating insights…
                </span>
              ) : (
                <Button onClick={handleGenerate}>
                  <SparklesIcon size={16} />
                  Generate insights
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-border bg-background p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <SparklesIcon size={18} className="text-primary" />
        <h2 className="font-semibold tracking-tight">AI career insights</h2>
      </div>

      <Section title="A day in the life">
        <p className="text-sm text-muted">{insights.dayInLife}</p>
      </Section>

      <Section title="Insider insights">
        <ul className="space-y-1.5">
          {insights.insights.map((tip) => (
            <li key={tip} className="flex items-start gap-2 text-sm text-muted">
              <ChevronRightIcon size={15} className="mt-0.5 shrink-0 text-primary" />
              {tip}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Recommended projects">
        <ul className="space-y-2">
          {insights.recommendedProjects.map((project) => (
            <li key={project.title} className="rounded-lg border border-border bg-surface p-3">
              <p className="flex items-center gap-1.5 text-sm font-medium">
                <RocketIcon size={14} className="text-primary" />
                {project.title}
              </p>
              <p className="mt-0.5 text-sm text-muted">{project.description}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Learning path">
        <ol className="space-y-2">
          {insights.learningPath.map((step, index) => (
            <li key={step.stage} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary tabular-nums">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{step.stage}</p>
                <p className="text-sm text-muted">{step.focus}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Future outlook">
        <p className="text-sm text-muted">{insights.outlook}</p>
      </Section>
    </div>
  );
}
