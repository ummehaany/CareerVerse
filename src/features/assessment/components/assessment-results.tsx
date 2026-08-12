"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  SparklesIcon,
  TargetIcon,
  RouteIcon,
  FileTextIcon,
  MicIcon,
  PuzzleIcon,
  RocketIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  TrendingUpIcon,
  ChartIcon,
} from "@/components/ui/icon";
import { AwardIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import type { AssessmentResults, CareerMatch, ConfidenceLevel } from "../engine/types";

function compatColor(v: number): string {
  return v >= 75 ? "var(--success)" : v >= 60 ? "var(--primary)" : v >= 40 ? "var(--warning)" : "var(--danger)";
}

function ConfidenceBadge({ level }: { level: ConfidenceLevel }) {
  const variant = level === "High" ? "success" : level === "Medium" ? "warning" : "muted";
  return <Badge variant={variant as "success" | "warning" | "muted"}>{level} confidence</Badge>;
}

function MatchCard({ match, primary = false }: { match: CareerMatch; primary?: boolean }) {
  const color = compatColor(match.compatibility);
  return (
    <Card className={"space-y-3 " + (primary ? "border-primary/30" : "")}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          {primary && (
            <span className="mb-1 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-primary">
              <SparklesIcon size={12} /> Primary match
            </span>
          )}
          <Link href={`${ROUTES.careers}/${match.slug}`} className="block truncate text-base font-semibold tracking-tight hover:text-primary">
            {match.title}
          </Link>
          <p className="text-xs text-muted">{match.category} · {match.salaryLabel}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xl font-bold tabular-nums" style={{ color }}>{match.compatibility}%</p>
          <p className="text-[10px] font-medium uppercase tracking-wide text-subtle">match</p>
        </div>
      </div>

      <Progress value={match.compatibility} color={color} />

      <ul className="space-y-1">
        {match.reasons.map((r) => (
          <li key={r} className="flex items-start gap-2 text-sm text-muted">
            <CheckCircleIcon size={14} className="mt-0.5 shrink-0 text-success" />
            {r}
          </li>
        ))}
      </ul>

      {match.drivingDimensions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {match.drivingDimensions.map((d) => (
            <span key={d} className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{d}</span>
          ))}
        </div>
      )}

      {match.skillsToDevelop.length > 0 && (
        <div className="border-t border-border pt-2">
          <p className="text-xs font-semibold text-subtle">Skills to develop</p>
          <div className="mt-1 flex flex-wrap gap-1.5">
            {match.skillsToDevelop.map((s) => (
              <span key={s} className="rounded-full border border-border bg-foreground/[0.03] px-2 py-0.5 text-xs text-foreground/75">{s}</span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

function CtaLink({ href, icon, title, desc }: { href: string; icon: ReactNode; title: string; desc: string }) {
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

export function AssessmentResults({ data }: { data: AssessmentResults }) {
  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      {/* Header */}
      <Card
        className="relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--primary) 16%, var(--background)) 0%, var(--background) 62%)" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
              <SparklesIcon size={14} /> Your Career Discovery report
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Your personalized career profile</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted">{data.summary}</p>
            <div className="mt-3"><ConfidenceBadge level={data.confidenceLevel} /></div>
          </div>
          <div className="shrink-0 rounded-2xl border border-border bg-background/70 p-4 text-center backdrop-blur-sm">
            <p className="text-3xl font-bold tabular-nums text-primary">{data.readinessScore}</p>
            <p className="text-[11px] font-medium uppercase tracking-wide text-subtle">Career readiness<br />starting score</p>
          </div>
        </div>
      </Card>

      {/* Primary + Top matches */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Your best career matches</h2>
        {data.primaryMatch && <MatchCard match={data.primaryMatch} primary />}
        <div className="grid gap-4 md:grid-cols-2">
          {data.topMatches.slice(1).map((m) => <MatchCard key={m.slug} match={m} />)}
        </div>
      </section>

      {/* Dimension profile */}
      <Card className="space-y-4">
        <div className="flex items-center gap-2">
          <ChartIcon size={18} className="text-primary" />
          <h2 className="text-base font-semibold tracking-tight">Your dimension profile</h2>
        </div>
        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {data.dimensions.map((d) => (
            <div key={d.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted">{d.label}</span>
                <span className="font-medium tabular-nums">{d.score}</span>
              </div>
              <Progress value={d.score} />
            </div>
          ))}
        </div>
      </Card>

      {/* Strengths + growth */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="space-y-3">
          <div className="flex items-center gap-2"><TrendingUpIcon size={16} className="text-success" /><h3 className="text-sm font-semibold">Top strengths</h3></div>
          {data.topStrengths.map((d) => (
            <div key={d.id}><div className="flex justify-between text-sm"><span className="font-medium">{d.label}</span><span className="tabular-nums text-success">{d.score}</span></div><p className="text-xs text-muted">{d.description}</p></div>
          ))}
        </Card>
        <Card className="space-y-3">
          <div className="flex items-center gap-2"><PuzzleIcon size={16} className="text-warning" /><h3 className="text-sm font-semibold">Growth areas</h3></div>
          {data.growthAreas.map((d) => (
            <div key={d.id}><div className="flex justify-between text-sm"><span className="font-medium">{d.label}</span><span className="tabular-nums text-warning">{d.score}</span></div><p className="text-xs text-muted">{d.description}</p></div>
          ))}
        </Card>
      </div>

      {/* Profile insights */}
      <Card className="space-y-4">
        <h2 className="text-base font-semibold tracking-tight">Personality & work insights</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Insight label="Social energy" value={data.personality.socialEnergy} />
          <Insight label="Decision style" value={data.personality.decisionStyle} />
          <Insight label="Structure" value={data.personality.structure} />
          <Insight label="Preferred environment" value={data.workEnvironment} />
          <Insight label="Leadership style" value={data.leadershipStyle} />
          <Insight label="Learning style" value={data.learningStyle} />
        </div>
        {data.values.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Career values</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {data.values.map((v) => <Badge key={v} variant="muted">{v}</Badge>)}
            </div>
          </div>
        )}
      </Card>

      {/* Alternatives + target companies */}
      <div className="grid gap-5 md:grid-cols-2">
        {data.alternatives.length > 0 && (
          <Card className="space-y-2">
            <h3 className="text-sm font-semibold">Alternative options</h3>
            {data.alternatives.map((m) => (
              <Link key={m.slug} href={`${ROUTES.careers}/${m.slug}`} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 transition-colors hover:border-foreground/20">
                <span className="truncate text-sm font-medium">{m.title}</span>
                <span className="shrink-0 text-sm font-semibold tabular-nums" style={{ color: compatColor(m.compatibility) }}>{m.compatibility}%</span>
              </Link>
            ))}
          </Card>
        )}
        {data.dreamCompanies.length > 0 && (
          <Card className="space-y-2">
            <div className="flex items-center gap-2"><RocketIcon size={16} className="text-primary" /><h3 className="text-sm font-semibold">Target companies that align</h3></div>
            {data.dreamCompanies.map((co) => (
              <Link key={co.slug} href={`${ROUTES.companies}/${co.slug}`} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 transition-colors hover:border-foreground/20">
                <span className="truncate text-sm font-medium">{co.name}</span>
                <span className="shrink-0 text-xs text-subtle">{co.reason}</span>
              </Link>
            ))}
          </Card>
        )}
      </div>

      {/* Skills + certs */}
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="space-y-2">
          <div className="flex items-center gap-2"><PuzzleIcon size={16} className="text-primary" /><h3 className="text-sm font-semibold">Recommended skills to learn</h3></div>
          {data.skillsToLearn.length ? (
            <div className="flex flex-wrap gap-1.5">{data.skillsToLearn.map((s) => <span key={s} className="rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-xs font-medium text-foreground/80">{s}</span>)}</div>
          ) : <p className="text-sm text-subtle">Great coverage — focus on depth and projects.</p>}
        </Card>
        <Card className="space-y-2">
          <div className="flex items-center gap-2"><AwardIcon size={16} className="text-primary" /><h3 className="text-sm font-semibold">Suggested certifications</h3></div>
          {data.certifications.length ? (
            <ul className="space-y-1">{data.certifications.map((c) => <li key={c} className="flex items-start gap-2 text-sm text-muted"><CheckCircleIcon size={14} className="mt-0.5 shrink-0 text-success" />{c}</li>)}</ul>
          ) : <p className="text-sm text-subtle">Certifications optional — prioritize projects.</p>}
        </Card>
      </div>

      {/* Integration CTAs */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Your next steps</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <CtaLink href={ROUTES.recommendations} icon={<TargetIcon size={18} />} title="Career Matches" desc="See your full ranked matches" />
          <CtaLink href={ROUTES.roadmap} icon={<RouteIcon size={18} />} title="Learning Roadmap" desc="Turn your match into a plan" />
          <CtaLink href={ROUTES.skillGap} icon={<PuzzleIcon size={18} />} title="Skill Gap Analysis" desc="Measure and close your gaps" />
          <CtaLink href={ROUTES.resume} icon={<FileTextIcon size={18} />} title="Resume Builder" desc="Build a role-ready resume" />
          <CtaLink href={ROUTES.interviews} icon={<MicIcon size={18} />} title="AI Mock Interview" desc="Practice for your matches" />
          <CtaLink href={ROUTES.coach} icon={<SparklesIcon size={18} />} title="AI Career Coach" desc="Ask about your results" />
        </div>
        <div className="pt-2 text-center">
          <Link href={`${ROUTES.assessment}?retake=1`} className="text-sm font-medium text-primary hover:underline">
            Retake the assessment
          </Link>
        </div>
      </section>
    </div>
  );
}

function Insight({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</p>
      <p className="mt-1 text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}
