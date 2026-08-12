"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SparklesIcon, CheckIcon, XIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { PRO_BENEFITS, FEATURE_LABELS, type MeteredFeature } from "../config";
import { OPEN_UPGRADE_EVENT, type UpgradeEventDetail } from "../events";

/**
 * Global "limit reached" dialog. Opens on the OPEN_UPGRADE_EVENT window event.
 * Honest by design: Pro isn't purchasable yet (no payment provider is wired
 * up), so this never offers an "Upgrade" action — it explains the Free-plan
 * limit, that the allowance resets monthly, and that Pro is planned but not
 * available yet.
 */
export function UpgradeDialog() {
  const [open, setOpen] = useState(false);
  const [feature, setFeature] = useState<string | null>(null);

  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent<UpgradeEventDetail>).detail;
      setFeature(detail?.feature ?? null);
      setOpen(true);
    };
    window.addEventListener(OPEN_UPGRADE_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_UPGRADE_EVENT, onOpen);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  if (!open) return null;

  const label = feature && feature in FEATURE_LABELS ? FEATURE_LABELS[feature as MeteredFeature] : null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cv-upgrade-title"
      onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}
    >
      <div className="animate-fade-up w-full max-w-md overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
        <div className="relative bg-gradient-to-br from-primary/[0.12] via-background to-background p-6 text-center sm:p-7">
          <button
            type="button"
            onClick={close}
            aria-label="Close"
            className="absolute right-3 top-3 rounded-md p-1 text-subtle transition-colors hover:text-foreground"
          >
            <XIcon size={16} />
          </button>
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <SparklesIcon size={28} />
          </span>
          <h2 id="cv-upgrade-title" className="mt-4 text-xl font-bold tracking-tight">
            {label ? `You've reached your Free-plan ${label} limit` : "You've reached your Free-plan limit"}
          </h2>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            You can keep using this feature once your monthly allowance resets. Pro isn&apos;t available yet, so
            there&apos;s nothing to upgrade to right now.
          </p>
        </div>

        <div className="px-6 pb-6 sm:px-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">Planned for Pro</p>
          <ul className="space-y-2">
            {PRO_BENEFITS.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm">
                <CheckIcon size={16} className="mt-0.5 shrink-0 text-success" />
                <span className="text-muted">{b}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <Button onClick={close} className="flex-1">
              Got it
            </Button>
            <Link
              href={ROUTES.pricing}
              onClick={close}
              className="inline-flex h-10 flex-1 items-center justify-center rounded-md border border-foreground/15 px-4 text-sm font-medium text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              See Pro plans
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
