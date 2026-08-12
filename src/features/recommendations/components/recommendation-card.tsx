"use client";

import { useState, type ReactNode } from "react";
import type { CareerRecommendation } from "@/types/recommendation";
import { MatchRing } from "./match-ring";
import { Badge } from "@/components/ui/badge";
import {
  DollarIcon,
  TrendingUpIcon,
  BookIcon,
  SparklesIcon,
  TargetIcon,
  RocketIcon,
  CheckIcon,
  ChevronRightIcon,
} from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function formatSalary(salary: CareerRecommendation["salaryRange"]): string {
  const currency = salary.currency.toUpperCase();

  // The offline engine reports Indian pay as ₹ LPA (Lakhs Per Annum).
  if (currency === "INR") {
    const lpa = (n: number) => (Number.isInteger(n) ? `${n}` : n.toFixed(1));
    return `₹${lpa(salary.min)} LPA – ₹${lpa(salary.max)} LPA`;
  }

  const symbol = currency === "USD" ? "$" : "";
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

function ChipList({ items }: { items: string[] }) {
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

function DetailBlock({
  icon,
  title,
  children,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <span className="text-primary">{icon}</span>
        {title}
      </p>
      {children}
    </div>
  );
}

export function RecommendationCard({
  recommendation,
  rank,
  defaultOpen = false,
}: {
  recommendation: CareerRecommendation;
  rank: number;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const detailsId = `rec-${rank}-details`;

  return (
    <article className="overflow-hidden rounded-2xl border border-border bg-background transition-shadow hover:shadow-sm">
      <div className="flex items-start gap-4 p-5 sm:p-6">
        <MatchRing value={recommendation.matchPercentage} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="muted">#{rank}</Badge>
          </div>
          <h3 className="mt-1.5 text-lg font-semibold tracking-tight">{recommendation.title}</h3>
          <p className="mt-1 text-sm text-muted">{recommendation.overview}</p>

          <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-sm">
            <span className="inline-flex items-center gap-1.5 text-foreground/80">
              <DollarIcon size={16} className="text-subtle" />
              {formatSalary(recommendation.salaryRange)}
            </span>
            <span className="inline-flex items-center gap-1.5 text-foreground/80">
              <TrendingUpIcon size={16} className="text-subtle" />
              {recommendation.industryGrowth.outlook} growth
            </span>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={detailsId}
        className="flex w-full items-center justify-between gap-2 border-t border-border px-5 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary/5 sm:px-6"
      >
        {open ? "Hide details" : "View details"}
        <ChevronRightIcon size={16} className={cn("transition-transform", open && "rotate-90")} />
      </button>

      {open && (
        <div id={detailsId} className="space-y-5 border-t border-border p-5 sm:p-6">
          <DetailBlock icon={<TargetIcon size={16} />} title="Why it matches you">
            <p className="text-sm text-muted">{recommendation.whyItMatches}</p>
          </DetailBlock>

          <div className="grid gap-5 sm:grid-cols-2">
            <DetailBlock icon={<SparklesIcon size={16} />} title="Strengths identified">
              <ChipList items={recommendation.strengthsIdentified} />
            </DetailBlock>
            <DetailBlock icon={<TargetIcon size={16} />} title="Skills to improve">
              <ChipList items={recommendation.skillsToImprove} />
            </DetailBlock>
          </div>

          <DetailBlock icon={<TrendingUpIcon size={16} />} title="Industry growth">
            <p className="text-sm text-muted">{recommendation.industryGrowth.summary}</p>
          </DetailBlock>

          <div className="grid gap-5 sm:grid-cols-2">
            <DetailBlock icon={<BookIcon size={16} />} title="Required education">
              <p className="text-sm text-muted">{recommendation.requiredEducation}</p>
            </DetailBlock>
            <DetailBlock icon={<CheckIcon size={16} />} title="Recommended certifications">
              {recommendation.recommendedCertifications.length ? (
                <ul className="space-y-1">
                  {recommendation.recommendedCertifications.map((cert) => (
                    <li key={cert} className="flex items-start gap-2 text-sm text-muted">
                      <CheckIcon size={15} className="mt-0.5 shrink-0 text-success" />
                      {cert}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-subtle">No specific certifications required.</p>
              )}
            </DetailBlock>
          </div>

          <DetailBlock icon={<RocketIcon size={16} />} title="Future opportunities">
            <ul className="space-y-1">
              {recommendation.futureOpportunities.map((opp) => (
                <li key={opp} className="flex items-start gap-2 text-sm text-muted">
                  <ChevronRightIcon size={15} className="mt-0.5 shrink-0 text-primary" />
                  {opp}
                </li>
              ))}
            </ul>
          </DetailBlock>
        </div>
      )}
    </article>
  );
}
