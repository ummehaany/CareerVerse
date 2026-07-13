"use client";

import type { LearningResourceView } from "../types";
import { Badge } from "@/components/ui/badge";
import { ExternalLinkIcon, BookmarkIcon, BookmarkFilledIcon, StarIcon } from "@/components/ui/icons-extended";
import { cn } from "@/lib/utils";

const TYPE_LABEL: Record<LearningResourceView["type"], string> = {
  course: "Course",
  video: "Video",
  article: "Guide",
  book: "Book",
  practice: "Practice",
  tool: "Tool",
};

const COST_LABEL: Record<LearningResourceView["cost"], string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
};

export function ResourceCard({
  resource,
  bookmarked,
  onToggleBookmark,
}: {
  resource: LearningResourceView;
  bookmarked: boolean;
  onToggleBookmark: () => void;
}) {
  return (
    <article className="flex flex-col rounded-xl border border-border bg-background p-4 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge variant="muted">{TYPE_LABEL[resource.type]}</Badge>
          {resource.recommended && (
            <Badge variant="primary">
              <StarIcon size={12} />
              For you
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

      <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-subtle">
        <span className="capitalize">{resource.level === "all" ? "All levels" : resource.level}</span>
        <span aria-hidden="true">·</span>
        <span>{COST_LABEL[resource.cost]}</span>
        <span aria-hidden="true">·</span>
        <span>{resource.category}</span>
      </div>

      <a
        href={resource.url}
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
