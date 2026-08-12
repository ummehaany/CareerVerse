"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  SparklesIcon,
  PuzzleIcon,
  RouteIcon,
  FileTextIcon,
  MicIcon,
  RocketIcon,
  CompassIcon,
  ArrowRightIcon,
  ClockIcon,
  CheckCircleIcon,
  ShieldIcon,
} from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import type { CareerMatch } from "../types";
import { TOTAL_ADVANCED_QUESTIONS, ESTIMATED_ADVANCED_MINUTES } from "../questions";

function compatColor(v: number): string {
  return v >= 80 ? "var(--success)" : v >= 55 ? "var(--primary)" : "var(--warning)";
}

function careerHref(match: CareerMatch): string {
  return `${ROUTES.careers}/${match.catalogSlug}`;
}

function MatchCard({ match, rank }: { match: CareerMatch; rank: number }) {
  const color = compatColor(match.matchPercent);
  return (
    <Card className={rank === 0 ? "space-y-3 border-primary/30" : "space-y-3"}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {rank === 0 && (
            <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <SparklesIcon size={12} /> Top match
            </span>
          )}
          <Link href={careerHref(match)} className="block truncate text-base font-semibold tracking-tight hover:text-primary">
            {match.title}
          </Link>
          <p className="text-xs text-muted">{match.category}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold tabular-nums" style={{ color }}>{match.matchPercent}%</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-subtle">alignment</p>
        </div>
      </div>

      <Progress value={match.matchPercent} color={color} />

      <div className="border-t border-border pt-2.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Why this matches you</p>
        <p className="mt-1 text-sm text-foreground/80">{match.explanation}</p>
        {match.drivers.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {match.drivers.map((d) => (
              <span key={d} className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {d}
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function NextStepLink({ href, icon, title, desc }: { href: string; icon: ReactNode; title: string; desc: string }) {
  return (
    <Link href={href} className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-colors hover:border-foreground/20">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block truncate text-xs text-muted">{desc}</span>
      </span>
      <ArrowRightIcon size={15} className="shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

export function DiscoveryResults({
  matches,
  exploreMore,
  advancedCompleted,
  onStartAdvanced,
  onRetake,
}: {
  matches: CareerMatch[];
  /** Ranks 4–6 — a few more honestly-ranked options beyond the top 3, so a
   * mixed profile isn't limited to only its three closest (and sometimes
   * near-identical) matches. */
  exploreMore: CareerMatch[];
  advancedCompleted: boolean;
  onStartAdvanced: () => void;
  onRetake: () => void;
}) {
  const [dismissedUpsell, setDismissedUpsell] = useState(false);
  const topMatch = matches[0];
  // The Target Companies module is genuinely tech/business-shaped — only
  // point students there when that's actually their field. Everyone else
  // gets a link to their top match's real Career Explorer page instead,
  // which already has field-appropriate detail (education path, salary,
  // certifications, where people in that career actually work).
  const companiesFieldRelevant = topMatch?.fieldId === "technology" || topMatch?.fieldId === "business";

  return (
    <div className="mx-auto max-w-4xl space-y-8 animate-fade-up">
      <section className="space-y-1 text-center sm:text-left">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
          <SparklesIcon size={14} /> Career Discovery results
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Your Top Career Matches</h1>
        {topMatch && (
          <p className="inline-flex flex-wrap items-center gap-1.5 text-sm text-muted">
            <CompassIcon size={14} className="text-primary" />
            Your answers pointed most strongly toward <span className="font-medium text-foreground">{topMatch.fieldLabel}</span>.
          </p>
        )}
        <p className="flex items-start gap-1.5 text-xs text-subtle">
          <ShieldIcon size={13} className="mt-0.5 shrink-0" />
          These percentages reflect how clearly your answers point in each direction — they&apos;re guidance to help you explore, not a guaranteed or scientific prediction.
        </p>
        {advancedCompleted && (
          <Badge variant="success" className="mt-1">
            <CheckCircleIcon size={12} /> Refined with your advanced answers
          </Badge>
        )}
      </section>

      <section className="space-y-3">
        {matches.map((m, i) => (
          <MatchCard key={m.id} match={m} rank={i} />
        ))}
      </section>

      {exploreMore.length > 0 && (
        <section className="space-y-2.5">
          <h2 className="text-sm font-semibold tracking-tight text-foreground/80">Other careers worth exploring</h2>
          <p className="text-xs text-muted">A few more directions your answers pointed toward, beyond your top 3.</p>
          <div className="flex flex-wrap gap-2">
            {exploreMore.map((m) => (
              <Link
                key={m.id}
                href={careerHref(m)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground/80 transition-colors hover:border-foreground/25 hover:text-foreground"
              >
                {m.title}
                <span className="text-xs text-subtle">{m.matchPercent}%</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Your Next Steps</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <NextStepLink href={ROUTES.skillGap} icon={<PuzzleIcon size={18} />} title="Build the recommended skills" desc="See your skill gaps and close them" />
          <NextStepLink href={ROUTES.roadmap} icon={<RouteIcon size={18} />} title="Explore your career roadmap" desc="Turn your match into a plan" />
          <NextStepLink href={ROUTES.interviews} icon={<MicIcon size={18} />} title="Prepare for interviews" desc="Practice for the roles you matched" />
          {companiesFieldRelevant ? (
            <NextStepLink href={ROUTES.companies} icon={<RocketIcon size={18} />} title="Explore target companies" desc="Find companies hiring for this path" />
          ) : topMatch ? (
            <NextStepLink href={careerHref(topMatch)} icon={<RocketIcon size={18} />} title={`Learn more about ${topMatch.title}`} desc="Education path, outlook, and where people in this career work" />
          ) : null}
          <NextStepLink href={ROUTES.resume} icon={<FileTextIcon size={18} />} title="Improve your resume" desc="Build a resume for your top match" />
        </div>
      </section>

      {!advancedCompleted && !dismissedUpsell && (
        <Card className="space-y-4 border-primary/20 bg-primary/[0.03]">
          <div>
            <h2 className="text-base font-semibold tracking-tight">Want more personalized recommendations?</h2>
            <p className="mt-1 text-sm text-muted">Take Advanced Career Discovery</p>
          </div>
          <ul className="space-y-1.5 text-sm text-foreground/80">
            <li className="flex items-start gap-2"><CheckCircleIcon size={14} className="mt-0.5 shrink-0 text-primary" />{TOTAL_ADVANCED_QUESTIONS} additional questions</li>
            <li className="flex items-start gap-2"><CheckCircleIcon size={14} className="mt-0.5 shrink-0 text-primary" />Deeper career preferences</li>
            <li className="flex items-start gap-2"><CheckCircleIcon size={14} className="mt-0.5 shrink-0 text-primary" />More detailed personality &amp; work-style insights</li>
            <li className="flex items-start gap-2"><CheckCircleIcon size={14} className="mt-0.5 shrink-0 text-primary" />More refined career matching across the full catalog</li>
          </ul>
          <p className="inline-flex items-center gap-1.5 text-xs text-subtle">
            <ClockIcon size={13} /> Estimated time: {ESTIMATED_ADVANCED_MINUTES}–7 minutes
          </p>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <Button onClick={onStartAdvanced}>
              Start Advanced Discovery
              <ArrowRightIcon size={16} />
            </Button>
            <Button variant="ghost" onClick={() => setDismissedUpsell(true)}>Maybe Later</Button>
          </div>
        </Card>
      )}

      <div className="pt-1 text-center">
        <button type="button" onClick={onRetake} className="text-sm font-medium text-primary hover:underline">
          Retake Career Discovery
        </button>
      </div>
    </div>
  );
}
