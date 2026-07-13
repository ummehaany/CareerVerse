"use client";

import Link from "next/link";
import type { Career } from "@/lib/careers/types";
import { formatSalaryRange, demandVariant } from "../format";
import { FavoriteButton } from "./favorite-button";
import { Badge } from "@/components/ui/badge";
import { DollarIcon, ArrowRightIcon } from "@/components/ui/icon";

export function CareerCard({
  career,
  favorited,
  onToggleFavorite,
}: {
  career: Career;
  favorited: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <Link
      href={`/careers/${career.slug}`}
      className="group flex flex-col rounded-xl border border-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-full bg-foreground/[0.05] px-2 py-0.5 text-xs font-medium text-muted">
          {career.category}
        </span>
        <div className="flex items-center gap-1">
          <Badge variant={demandVariant(career.demand)}>{career.demand}</Badge>
          <FavoriteButton favorited={favorited} onToggle={onToggleFavorite} />
        </div>
      </div>
      <h3 className="mt-3 font-semibold tracking-tight">{career.title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted">{career.tagline}</p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="inline-flex items-center gap-1.5 text-foreground/80">
          <DollarIcon size={15} className="text-subtle" />
          {formatSalaryRange(career.salary)}
        </span>
        <ArrowRightIcon
          size={16}
          className="text-primary transition-transform group-hover:translate-x-0.5"
        />
      </div>
    </Link>
  );
}
