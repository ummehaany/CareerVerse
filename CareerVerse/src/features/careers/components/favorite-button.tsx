"use client";

import { BookmarkIcon, BookmarkFilledIcon } from "@/components/ui/icons-extended";
import { cn } from "@/lib/utils";

export function FavoriteButton({
  favorited,
  onToggle,
  className,
  withLabel = false,
}: {
  favorited: boolean;
  onToggle: () => void;
  className?: string;
  withLabel?: boolean;
}) {
  if (withLabel) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={favorited}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors",
          favorited
            ? "border-primary bg-primary/10 text-primary"
            : "border-border text-muted hover:bg-foreground/5",
          className,
        )}
      >
        {favorited ? <BookmarkFilledIcon size={15} /> : <BookmarkIcon size={15} />}
        {favorited ? "Saved" : "Save as favorite"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggle();
      }}
      aria-pressed={favorited}
      aria-label={favorited ? "Remove from saved careers" : "Save career"}
      className={cn(
        "rounded-lg p-1.5 transition-colors hover:bg-foreground/5",
        favorited ? "text-primary" : "text-subtle",
        className,
      )}
    >
      {favorited ? <BookmarkFilledIcon size={18} /> : <BookmarkIcon size={18} />}
    </button>
  );
}
