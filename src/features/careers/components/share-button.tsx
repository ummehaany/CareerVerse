"use client";

import { useState } from "react";
import { CheckIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function ShareGlyph({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

/**
 * Share a career via the native Web Share sheet, falling back to copying the
 * link to the clipboard. Two presentations: an icon button (cards) and a
 * labelled button (detail page).
 */
export function ShareButton({
  slug,
  title,
  withLabel = false,
  className,
}: {
  slug: string;
  title: string;
  withLabel?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const url =
      typeof window !== "undefined" ? `${window.location.origin}/careers/${slug}` : `/careers/${slug}`;
    const payload = { title: `${title} — CareerVerse`, text: `Explore ${title} on CareerVerse`, url };

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(payload);
        return;
      } catch {
        // cancelled or unsupported — fall through to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard blocked — nothing else we can safely do
    }
  }

  if (withLabel) {
    return (
      <button
        type="button"
        onClick={handleShare}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium text-muted transition-colors hover:bg-foreground/5",
          className,
        )}
      >
        {copied ? <CheckIcon size={15} className="text-success" /> : <ShareGlyph size={15} />}
        {copied ? "Link copied" : "Share"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      aria-label={`Share ${title}`}
      className={cn(
        "rounded-lg p-1.5 text-subtle transition-colors hover:bg-foreground/5 hover:text-foreground",
        className,
      )}
    >
      {copied ? <CheckIcon size={18} className="text-success" /> : <ShareGlyph size={18} />}
    </button>
  );
}
