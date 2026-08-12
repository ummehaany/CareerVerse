"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LinkIcon } from "@/components/ui/icons-extended";
import { CheckIcon } from "@/components/ui/icon";
import type { ProfilePageData } from "../types";

function CopyIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ShareIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
    </svg>
  );
}

/** Decorative QR placeholder (not a scannable code). */
function QrPlaceholder() {
  return (
    <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="QR code placeholder">
      <rect width="100" height="100" rx="10" className="fill-foreground/[0.04]" />
      {/* finder squares */}
      {[[14, 14], [64, 14], [14, 64]].map(([x, y], i) => (
        <g key={i}>
          <rect x={x} y={y} width="22" height="22" rx="4" className="fill-none stroke-foreground/25" strokeWidth="4" />
          <rect x={x + 7} y={y + 7} width="8" height="8" rx="2" className="fill-foreground/25" />
        </g>
      ))}
      {/* scattered modules */}
      {[[46, 20], [52, 26], [46, 32], [58, 20], [46, 44], [52, 50], [58, 56], [64, 50], [70, 44], [46, 58], [40, 70], [52, 64], [58, 70], [64, 64], [70, 70], [76, 58]].map(([x, y], i) => (
        <rect key={`m${i}`} x={x} y={y} width="6" height="6" rx="1.5" className="fill-foreground/20" />
      ))}
    </svg>
  );
}

export function PublicProfileCard({ data }: { data: ProfilePageData }) {
  const { identity, career, stats } = data;
  const [copied, setCopied] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(identity.publicUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setShareMsg("Copy failed — select and copy the link manually.");
      window.setTimeout(() => setShareMsg(null), 3000);
    }
  }

  async function share() {
    const nav = navigator as Navigator & { share?: (d: ShareData) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({
          title: `${identity.name} · CareerVerse`,
          text: `Check out ${identity.name}'s CareerVerse profile`,
          url: identity.publicUrl,
        });
        return;
      } catch {
        /* user cancelled or unsupported — fall through to copy */
      }
    }
    await copyLink();
    setShareMsg("Sharing isn't available here — link copied instead.");
    window.setTimeout(() => setShareMsg(null), 3000);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-semibold tracking-tight">Public Career Profile</h2>
          <p className="text-sm text-muted">Your shareable CareerVerse identity.</p>
        </div>
        <Badge variant="muted">Coming soon</Badge>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        {/* Link + actions + QR */}
        <div className="space-y-4 rounded-2xl border border-border bg-background p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Your profile link</p>
            <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-border bg-surface px-3 py-2.5">
              <LinkIcon size={15} className="shrink-0 text-subtle" />
              <span className="truncate font-mono text-sm">{identity.publicPath}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              {copied ? <CheckIcon size={16} /> : <CopyIcon size={16} />}
              {copied ? "Copied!" : "Copy Link"}
            </button>
            <button
              type="button"
              onClick={share}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold transition-colors hover:bg-foreground/5"
            >
              <ShareIcon size={16} />
              Share Profile
            </button>
          </div>

          <div className="flex items-center gap-4 rounded-xl border border-dashed border-border p-4">
            <div className="h-20 w-20 shrink-0">
              <QrPlaceholder />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">QR code</p>
              <p className="text-xs text-muted">
                A scannable QR code for your profile will appear here once public profiles go live.
              </p>
            </div>
          </div>

          {shareMsg && <p className="text-xs text-muted" role="status">{shareMsg}</p>}
        </div>

        {/* Preview card */}
        <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/[0.08] via-background to-background p-5">
          <span className="absolute right-3 top-3 rounded-full bg-background/70 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-subtle backdrop-blur">
            Preview
          </span>
          <div className="flex items-center gap-3">
            <Avatar name={identity.name} email={identity.email} src={identity.photoURL} size={48} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{identity.name}</p>
              <p className="truncate text-xs text-muted">@{identity.username}</p>
            </div>
          </div>
          <p className="mt-3 line-clamp-2 text-sm text-muted">
            {career.careerGoal !== "Not set yet" ? career.careerGoal : "Aspiring to build a standout career."}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {career.skills.slice(0, 4).map((s) => (
              <span key={s} className="rounded-full border border-border bg-foreground/[0.03] px-2 py-0.5 text-[11px] font-medium text-foreground/80">
                {s}
              </span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs">
            <span className="text-muted">Career readiness</span>
            <span className="font-semibold tabular-nums text-primary">{stats.careerReadiness}%</span>
          </div>
        </div>
      </div>

      <p className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-muted">
        Soon you&apos;ll be able to share your CareerVerse profile with{" "}
        <span className="font-medium text-foreground">recruiters, mentors, and friends</span> — a live,
        always-up-to-date snapshot of your growth, skills, and career readiness. Public profiles are
        in development; your link is reserved and ready.
      </p>
    </section>
  );
}
