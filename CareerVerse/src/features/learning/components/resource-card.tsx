"use client";

import { memo } from "react";
import type { LearningResourceView } from "../types";
import { Badge } from "@/components/ui/badge";
import {
  ExternalLinkIcon,
  BookmarkIcon,
  BookmarkFilledIcon,
  StarIcon,
} from "@/components/ui/icons-extended";
import { ClockIcon, TrendingUpIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function ResourceCardImpl({
  resource,
  bookmarked,
  recommended,
  onToggleBookmark,
}: {
  resource: LearningResourceView;
  bookmarked: boolean;
  /** Personalized "For you" flag (from the recommendation engine). */
  recommended: boolean;
  onToggleBookmark: () => void;
}) {
  const careerTags = resource.careerTags.slice(0, 2);
  const extraTags = resource.careerTags.length - careerTags.length;

  return (
    <article className="flex flex-col rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="muted">{resource.resourceType}</Badge>
          <Badge variant={resource.freeOrPaid === "Paid" ? "muted" : "primary"}>
            {resource.freeOrPaid}
          </Badge>
          {recommended && (
            <Badge variant="primary">
              <StarIcon size={12} />
              For you
            </Badge>
          )}
          {!recommended && resource.trending && (
            <Badge variant="muted">
              <TrendingUpIcon size={12} />
              Trending
            </Badge>
          )}
        </div>
        <button
          type="button"
          onClick={onToggleBookmark}
          aria-pressed={bookmarked}
          aria-label={bookmarked ? "Remove from saved" : "Save resource"}
          className={cn(
            "-mr-1 -mt-1 rounded-lg p-1.5 transition-colors hover:bg-foreground/5",
            bookmarked ? "text-primary" : "text-subtle",
          )}
        >
          {bookmarked ? <BookmarkFilledIcon size={18} /> : <BookmarkIcon size={18} />}
        </button>
      </div>

      <h3 className="mt-2.5 font-semibold leading-snug tracking-tight">{resource.title}</h3>
      <p className="mt-0.5 text-xs text-subtle">{resource.provider}</p>
      <p className="mt-2 flex-1 text-sm text-muted">{resource.description}</p>

      {careerTags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {careerTags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-muted"
            >
              {tag}
            </span>
          ))}
          {extraTags > 0 && (
            <span className="rounded-full bg-foreground/5 px-2 py-0.5 text-[11px] font-medium text-subtle">
              +{extraTags}
            </span>
          )}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-subtle">
        <span>{resource.difficulty}</span>
        {resource.duration && (
          <>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <ClockIcon size={12} />
              {resource.duration}
            </span>
          </>
        )}
        {typeof resource.rating === "number" && (
          <>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1">
              <StarIcon size={12} className="text-amber-500" />
              {resource.rating.toFixed(1)}
            </span>
          </>
        )}
        <span aria-hidden="true">·</span>
        <span>{resource.category}</span>
      </div>

      <a
        href={resource.resourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
      >
        Open resource
        <ExternalLinkIcon size={15} />
      </a>
    </article>
  );
}

export const ResourceCard = memo(ResourceCardImpl);
