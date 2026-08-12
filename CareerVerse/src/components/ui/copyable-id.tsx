"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

/** Shortens a long opaque ID for display; full value is still available via copy. */
function truncate(value: string, headLength = 8): string {
  if (value.length <= headLength + 1) return value;
  return `${value.slice(0, headLength)}…`;
}

/**
 * Displays a truncated, monospace preview of an opaque identifier (e.g. an
 * auth UID) with a click-to-copy affordance for the full value. Keeps raw
 * technical IDs out of the default view while still making them available
 * (e.g. for support requests) without exposing them by default.
 */
export function CopyableId({
  value,
  label = "ID",
  className,
}: {
  value: string;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard may be unavailable/blocked — no-op */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      title={copied ? "Copied" : `Copy ${label}`}
      aria-label={copied ? "Copied" : `Copy ${label} to clipboard`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-foreground/20 hover:text-foreground",
        className,
      )}
    >
      {truncate(value)}
      {copied ? (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ) : (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="11" height="11" rx="2" />
          <path d="M5 15V5a2 2 0 0 1 2-2h10" />
        </svg>
      )}
    </button>
  );
}
