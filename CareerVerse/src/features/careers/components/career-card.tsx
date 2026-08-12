"use client";

import Link from "next/link";
import type { Career } from "@/lib/careers/types";
import { formatCareerSalary, demandVariant, type Currency } from "../format";
import { educationLevel, estLearningMonths, primaryWorkStyle } from "../filters";
import { FavoriteButton } from "./favorite-button";
import { ShareButton } from "./share-button";
import { Badge } from "@/components/ui/badge";
import { DollarIcon, TrendingUpIcon, ClockIcon, ArrowRightIcon } from "@/components/ui/icon";
import { GraduationCapIcon } from "@/components/ui/icons-extended";
import { cn } from "@/lib/utils";

function DifficultyDots({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`Difficulty ${value} of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn("h-1.5 w-1.5 rounded-full", n <= value ? "bg-primary" : "bg-foreground/15")}
        />
      ))}
    </span>
  );
}

export function CareerCard({
  career,
  favorited,
  onToggleFavorite,
  onView,
  currency = "INR",
}: {
  career: Career;
  favorited: boolean;
  onToggleFavorite: () => void;
  onView?: () => void;
  currency?: Currency;
}) {
  const skills = career.skills.slice(0, 3);
  const extraSkills = career.skills.length - skills.length;

  return (
    <Link
      href={`/careers/${career.slug}`}
      onClick={onView}
      className="group flex flex-col rounded-xl border border-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-foreground/[0.05] px-2 py-0.5 text-xs font-medium text-muted">
          {career.category}
        </span>
        <div className="flex items-center gap-0.5">
          <Badge variant={demandVariant(career.demand)}>{career.demand}</Badge>
          <ShareButton slug={career.slug} title={career.title} />
          <FavoriteButton favorited={favorited} onToggle={onToggleFavorite} />
        </div>
      </div>

      <h3 className="mt-3 font-semibold tracking-tight">{career.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{career.tagline}</p>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {skills.map((skill) => (
          <span
            key={skill}
            className="inline-flex rounded-full border border-border bg-foreground/[0.03] px-2 py-0.5 text-[11px] font-medium text-foreground/75"
          >
            {skill}
          </span>
        ))}
        {extraSkills > 0 && (
          <span className="inline-flex rounded-full px-1.5 py-0.5 text-[11px] font-medium text-subtle">
            +{extraSkills}
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-border pt-3 text-sm">
        <span className="inline-flex items-center gap-1.5 font-medium text-foreground/80">
          <DollarIcon size={15} className="text-subtle" />
          {formatCareerSalary(career, currency)}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-muted">
          <TrendingUpIcon size={13} className="text-subtle" />
          {career.growth}
        </span>
      </div>

      <div className="mt-2.5 grid grid-cols-3 gap-2 text-[11px] text-subtle">
        <span className="inline-flex items-center gap-1" title="Education required">
          <GraduationCapIcon size={13} />
          {educationLevel(career)}
        </span>
        <span className="inline-flex items-center gap-1" title="Estimated learning time">
          <ClockIcon size={13} />~{estLearningMonths(career)} mo
        </span>
        <span className="inline-flex items-center gap-1 justify-self-end" title="Difficulty level">
          <DifficultyDots value={career.difficulty} />
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <span className="rounded-full bg-primary/[0.08] px-2 py-0.5 text-[11px] font-medium text-primary">
          {primaryWorkStyle(career)}
        </span>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
          View
          <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </Link>
  );
}
