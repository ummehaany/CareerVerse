import type { ComponentType, ReactNode } from "react";
import Link from "next/link";
import type { IconProps } from "@/components/ui/icon";
import {
  CompassIcon,
  PuzzleIcon,
  RouteIcon,
  CodeIcon,
  BookIcon,
  DollarIcon,
  WrenchIcon,
  MicIcon,
  FileTextIcon,
  FlagIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
} from "@/components/ui/icon";
import { GraduationCapIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import type { CareerPlan, PlanDifficulty } from "../plan-types";

function SectionCard({
  index,
  icon: Icon,
  title,
  accentVar,
  children,
}: {
  index: number;
  icon: ComponentType<IconProps>;
  title: string;
  accentVar: string;
  children: ReactNode;
}) {
  const accent = `var(${accentVar})`;
  return (
    <section
      className="animate-fade-up rounded-2xl border border-border bg-background/70 p-5 shadow-sm backdrop-blur-xl sm:p-6"
      style={{ animationDelay: `${Math.min(index, 8) * 45}ms` }}
    >
      <div className="mb-4 flex items-center gap-3">
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
          style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }}
          aria-hidden="true"
        >
          <Icon size={20} />
        </span>
        <div className="flex items-baseline gap-2">
          <span className="text-xs font-semibold tabular-nums text-subtle">{String(index).padStart(2, "0")}</span>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        </div>
      </div>
      {children}
    </section>
  );
}

function Badges({ items, accentVar }: { items: string[]; accentVar?: string }) {
  const accent = accentVar ? `var(${accentVar})` : undefined;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span
          key={s}
          className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium"
          style={
            accent
              ? { color: accent, borderColor: `color-mix(in srgb, ${accent} 35%, transparent)`, backgroundColor: `color-mix(in srgb, ${accent} 10%, transparent)` }
              : undefined
          }
        >
          {s}
        </span>
      ))}
    </div>
  );
}

function MiniList({ label, items }: { label: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</p>
      <ul className="space-y-1">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2 text-sm text-muted">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-foreground/30" />
            {it}
          </li>
        ))}
      </ul>
    </div>
  );
}

const DIFFICULTY: Record<PlanDifficulty, { label: string; var: string }> = {
  Beginner: { label: "Beginner", var: "--success" },
  Intermediate: { label: "Intermediate", var: "--warning" },
  Advanced: { label: "Advanced", var: "--danger" },
};

export function CareerReport({ plan, aiUsed }: { plan: CareerPlan; aiUsed: boolean }) {
  return (
    <div className="space-y-4">
      <div className="animate-fade-up rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/[0.1] via-background to-background p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <SparklesIcon size={13} /> Career Plan
          </span>
          {plan.personalized && (
            <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted">
              Personalized to your profile
            </span>
          )}
          <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-subtle">
            {aiUsed ? "AI-generated" : "Curated plan"}
          </span>
        </div>
        <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">{plan.careerTitle}</h1>

        <div className="mt-4 flex flex-col gap-2 rounded-xl border border-border bg-surface p-3.5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted sm:text-sm">
            This is Coach guidance for exploring <span className="font-medium text-foreground">{plan.careerTitle}</span> — it&apos;s
            separate from your official CareerVerse Roadmap and isn&apos;t added to your Timeline or
            Achievements. Building a trackable roadmap requires completing Career Discovery first.
          </p>
          <Link
            href={ROUTES.roadmap}
            className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-primary hover:underline"
          >
            Go to my Roadmap
            <ArrowRightIcon size={14} />
          </Link>
        </div>
      </div>

      <SectionCard index={1} icon={CompassIcon} title="Career Overview" accentVar="--accent-assessment">
        <p className="text-sm text-muted">{plan.overview.what}</p>
        <div className="mt-3 rounded-xl border border-border bg-surface p-3.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">Who it&apos;s suitable for</p>
          <p className="mt-1 text-sm text-muted">{plan.overview.suitableFor}</p>
        </div>
        <div className="mt-3">
          <MiniList label="Daily responsibilities" items={plan.overview.responsibilities} />
        </div>
      </SectionCard>

      <SectionCard index={2} icon={PuzzleIcon} title="Skills Required" accentVar="--accent-roadmap">
        <Badges items={plan.skills} accentVar="--accent-roadmap" />
      </SectionCard>

      <SectionCard index={3} icon={RouteIcon} title="Suggested Learning Path" accentVar="--accent-resume">
        <ol className="relative space-y-4 border-l border-border pl-6">
          {plan.roadmap.map((m) => (
            <li key={m.month} className="relative">
              <span className="absolute -left-[27px] grid h-5 w-5 place-items-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {m.month}
              </span>
              <p className="text-sm font-semibold">Month {m.month} · {m.label}</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {m.focus.map((f) => (
                  <span key={f} className="rounded-md border border-border bg-surface px-2 py-0.5 text-xs text-muted">{f}</span>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </SectionCard>

      <SectionCard index={4} icon={CodeIcon} title="Recommended Projects" accentVar="--accent-interview">
        <div className="grid gap-3 sm:grid-cols-2">
          {plan.projects.map((p) => {
            const d = DIFFICULTY[p.difficulty];
            return (
              <div key={p.name} className="rounded-xl border border-border bg-background p-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold">{p.name}</h3>
                  <span
                    className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                    style={{ color: `var(${d.var})`, backgroundColor: `color-mix(in srgb, var(${d.var}) 14%, transparent)` }}
                  >
                    {d.label}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted">{p.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.skills.map((s) => (
                    <span key={s} className="rounded-md bg-foreground/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-muted">{s}</span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard index={5} icon={GraduationCapIcon} title="Courses & Certifications" accentVar="--accent-roadmap">
        <div className="grid gap-4 sm:grid-cols-2">
          <MiniList label="Free resources" items={plan.courses.free} />
          <MiniList label="Paid resources" items={plan.courses.paid} />
        </div>
      </SectionCard>

      <SectionCard index={6} icon={BookIcon} title="Books & Learning Resources" accentVar="--accent-mentor">
        <div className="grid gap-4 sm:grid-cols-2">
          <MiniList label="Books" items={plan.resources.books} />
          <MiniList label="Documentation" items={plan.resources.documentation} />
          <MiniList label="YouTube channels" items={plan.resources.youtube} />
          <MiniList label="Practice websites" items={plan.resources.practice} />
        </div>
      </SectionCard>

      <SectionCard index={7} icon={DollarIcon} title="Salary Insights" accentVar="--accent-roadmap">
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { label: "Entry Level", value: plan.salary.entry },
            { label: "Mid Level", value: plan.salary.mid },
            { label: "Senior Level", value: plan.salary.senior },
          ].map((t) => (
            <div key={t.label} className="rounded-xl border border-border bg-background p-4 text-center">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{t.label}</p>
              <p className="mt-1 text-sm font-semibold">{t.value}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-subtle">{plan.salary.note}</p>
      </SectionCard>

      <SectionCard index={8} icon={WrenchIcon} title="Required Tools" accentVar="--accent-interview">
        <Badges items={plan.tools} accentVar="--accent-interview" />
      </SectionCard>

      <SectionCard index={9} icon={MicIcon} title="Interview Preparation" accentVar="--accent-mentor">
        <div className="grid gap-4 sm:grid-cols-2">
          <MiniList label="Technical topics" items={plan.interviewPrep.technicalTopics} />
          <MiniList label="HR questions" items={plan.interviewPrep.hrQuestions} />
          <MiniList label="Coding preparation" items={plan.interviewPrep.coding} />
          <MiniList label="Aptitude preparation" items={plan.interviewPrep.aptitude} />
        </div>
      </SectionCard>

      <SectionCard index={10} icon={FileTextIcon} title="Resume Tips" accentVar="--accent-resume">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">Skills to highlight</p>
            <Badges items={plan.resumeTips.skillsToHighlight} />
          </div>
          <MiniList label="Projects to include" items={plan.resumeTips.projectsToInclude} />
          <MiniList label="Certifications to earn" items={plan.resumeTips.certifications} />
          <MiniList label="Portfolio improvements" items={plan.resumeTips.portfolio} />
        </div>
      </SectionCard>

      <SectionCard index={11} icon={FlagIcon} title="Weekly Action Plan" accentVar="--accent-assessment">
        <ul className="space-y-2">
          {plan.weeklyPlan.map((w) => (
            <li key={w.week} className="flex items-start gap-3 rounded-xl border border-border bg-background p-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-primary/10 text-[11px] font-bold text-primary">
                {w.week}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-subtle">Week {w.week}</p>
                <p className="text-sm">{w.focus}</p>
              </div>
              <CheckCircleIcon size={16} className="ml-auto mt-0.5 shrink-0 text-border" />
            </li>
          ))}
        </ul>
      </SectionCard>
    </div>
  );
}

export function ReportSkeleton() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <div className="cv-skeleton h-24 rounded-2xl" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-background/70 p-5 backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="cv-skeleton h-10 w-10 rounded-xl" />
            <div className="cv-skeleton h-4 w-40 rounded" />
          </div>
          <div className="space-y-2">
            <div className="cv-skeleton h-3 w-full rounded" />
            <div className="cv-skeleton h-3 w-5/6 rounded" />
            <div className="cv-skeleton h-3 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
