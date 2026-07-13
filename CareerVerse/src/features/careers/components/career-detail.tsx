import Link from "next/link";
import type { ReactNode } from "react";
import type { CareerDetailData } from "../queries";
import { formatSalaryRange, demandVariant } from "../format";
import { CareerInsightsPanel } from "./career-insights-panel";
import { CareerFavoriteToggle } from "./career-favorite-toggle";
import { SkillGap } from "./skill-gap";
import { CareerSimulator } from "./career-simulator";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeftIcon,
  DollarIcon,
  TrendingUpIcon,
  RouteIcon,
  ArrowRightIcon,
} from "@/components/ui/icon";
import { GraduationCapIcon, AwardIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { Career } from "@/lib/careers/types";

function Rating({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="text-xs text-subtle">{label}</p>
      <div className="mt-1 flex gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={cn("h-1.5 w-4 rounded-full", n <= value ? "bg-primary" : "bg-foreground/15")}
          />
        ))}
      </div>
      <span className="sr-only">
        {label}: {value} out of 5
      </span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-background p-5 sm:p-6">
      <h2 className="font-semibold tracking-tight">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-xs font-medium text-foreground/80"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export function CareerDetail({ data }: { data: CareerDetailData }) {
  const career = data.career as Career;

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <Link
        href={ROUTES.careers}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
      >
        <ChevronLeftIcon size={16} />
        All careers
      </Link>

      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-foreground/[0.06] px-2 py-0.5 text-xs font-medium text-muted">
            {career.category}
          </span>
          <Badge variant={demandVariant(career.demand)}>{career.demand} demand</Badge>
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">{career.title}</h1>
        <p className="mt-1 text-sm text-muted">{career.tagline}</p>

        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-subtle">Salary (illustrative)</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold">
              <DollarIcon size={14} className="text-subtle" />
              {formatSalaryRange(career.salary)}
            </p>
          </div>
          <div>
            <p className="text-xs text-subtle">Future demand</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm font-semibold">
              <TrendingUpIcon size={14} className="text-subtle" />
              {career.growth}
            </p>
          </div>
          <Rating value={career.workLifeBalance} label="Work-life balance" />
          <Rating value={career.difficulty} label="Difficulty" />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Link
            href={ROUTES.roadmap}
            className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <RouteIcon size={15} />
            Build a roadmap
          </Link>
          <CareerFavoriteToggle slug={career.slug} initialFavorited={data.favorited} />
        </div>
      </section>

      <SectionCard title="Role overview">
        <p className="text-sm text-muted">{career.whatDoes}</p>
      </SectionCard>

      <SectionCard title="Required skills">
        <TagList items={career.skills} />
      </SectionCard>

      <div className="grid gap-6 sm:grid-cols-2">
        <SectionCard title="Education path">
          <p className="inline-flex items-start gap-2 text-sm text-muted">
            <GraduationCapIcon size={16} className="mt-0.5 shrink-0 text-primary" />
            {career.education}
          </p>
        </SectionCard>
        <SectionCard title="Certifications">
          {career.certifications.length > 0 ? (
            <ul className="space-y-1.5">
              {career.certifications.map((cert) => (
                <li key={cert} className="flex items-start gap-2 text-sm text-muted">
                  <AwardIcon size={15} className="mt-0.5 shrink-0 text-primary" />
                  {cert}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-subtle">No formal certifications required.</p>
          )}
        </SectionCard>
      </div>

      <SectionCard title="Companies commonly hiring">
        <TagList items={career.companies} />
      </SectionCard>

      <CareerInsightsPanel
        slug={career.slug}
        initialInsights={data.insights}
        aiConfigured={data.aiConfigured}
      />

      <SectionCard title="Your skill gap">
        <SkillGap
          careerSlug={career.slug}
          career={career}
          userSkills={data.userSkills}
          initialLearned={data.learnedSkills}
        />
      </SectionCard>

      <SectionCard title="Career simulator">
        <CareerSimulator career={career} />
      </SectionCard>

      {data.related.length > 0 && (
        <SectionCard title="Related careers">
          <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {data.related.map((rel) => (
              <Link
                key={rel.slug}
                href={`/careers/${rel.slug}`}
                className="group flex items-center justify-between gap-2 rounded-lg border border-border p-3 transition-colors hover:border-foreground/25 hover:bg-foreground/[0.02]"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{rel.title}</p>
                  <p className="truncate text-xs text-muted">{rel.tagline}</p>
                </div>
                <ArrowRightIcon
                  size={15}
                  className="shrink-0 text-primary transition-transform group-hover:translate-x-0.5"
                />
              </Link>
            ))}
          </div>
        </SectionCard>
      )}
    </div>
  );
}
