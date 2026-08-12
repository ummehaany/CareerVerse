import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icon";
import type { NextBestAction } from "../types";
import { INTEL_ICONS } from "./icons";

/**
 * A slim, consistent contextual-recommendation banner reused across module
 * pages. Renders nothing when there's no relevant action, so pages stay clean.
 */
export function InsightTip({ action, label = "Recommended next" }: { action: NextBestAction | null; label?: string }) {
  if (!action) return null;
  const Icon = INTEL_ICONS[action.icon] ?? INTEL_ICONS.sparkles;
  const accent = `var(${action.accentVar})`;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 sm:flex-row sm:items-center">
      <span
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
        style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 13%, transparent)` }}
        aria-hidden="true"
      >
        <Icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</p>
        <p className="text-sm font-medium">{action.title}</p>
      </div>
      <Link
        href={action.href}
        className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-md border border-border px-3.5 text-sm font-medium transition-colors hover:bg-foreground/5"
      >
        {action.cta}
        <ArrowRightIcon size={15} />
      </Link>
    </div>
  );
}
