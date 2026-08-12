"use client";

import Link from "next/link";
import { CheckCircleIcon, ArrowRightIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { ChecklistItem } from "../checklist";

/**
 * Step 8 — first-milestones welcome card shown on the dashboard after
 * onboarding. Completion is derived from live data (passed in), so it updates
 * automatically as the user progresses; it hides itself once all are done.
 */
export function OnboardingChecklistCard({
  items,
  careerDiscoveryComplete = true,
  matchesExist = true,
}: {
  items: ChecklistItem[];
  /**
   * The Roadmap page itself hard-requires Career Discovery *and* a career
   * match before it will generate anything
   * (features/roadmap/components/roadmap-view.tsx — "Take your career
   * assessment first" / "Generate your career matches first"). "View Career
   * Roadmap" is the only checklist item that hits that wall, so it's the only
   * one that needs a prerequisite called out here; Target Companies and
   * Interview Practice are genuinely self-serve with no such gate. The link
   * stays clickable either way — the roadmap page's own empty state already
   * explains the next step.
   */
  careerDiscoveryComplete?: boolean;
  matchesExist?: boolean;
}) {
  const done = items.filter((i) => i.done).length;
  const total = items.length;
  if (done >= total) return null; // fully complete → nothing to show
  const roadmapReady = careerDiscoveryComplete && matchesExist;

  const pct = Math.round((done / total) * 100);

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 animate-fade-up sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">Welcome to CareerVerse 🎉</h2>
          <p className="mt-1 text-sm text-muted">Let&apos;s complete your first milestones.</p>
        </div>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          {done} / {total} Completed
        </span>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${pct}%` }}
        />
      </div>

      <ul className="mt-5 space-y-2">
        {items.map((item) => {
          const needsMatches = item.key === "roadmapViewed" && !item.done && !roadmapReady;
          return (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors",
                  item.done
                    ? "border-border bg-foreground/[0.02]"
                    : "border-border bg-background hover:border-foreground/20 hover:bg-foreground/[0.02]",
                  needsMatches && "opacity-60",
                )}
              >
                <span
                  className={cn(
                    "grid h-6 w-6 shrink-0 place-items-center rounded-full border transition-colors",
                    item.done
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-transparent",
                  )}
                  aria-hidden="true"
                >
                  <CheckCircleIcon size={14} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cn(
                      "block text-sm font-medium",
                      item.done ? "text-muted line-through" : "text-foreground",
                    )}
                  >
                    {item.label}
                  </span>
                  {needsMatches && (
                    <span className="block text-xs text-subtle">
                      {careerDiscoveryComplete
                        ? "Generate your career matches first"
                        : "Complete Career Discovery first"}
                    </span>
                  )}
                </span>
                {!item.done && (
                  <ArrowRightIcon
                    size={16}
                    className="shrink-0 text-subtle transition-transform group-hover:translate-x-0.5"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
