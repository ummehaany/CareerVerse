"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LinkIcon, ExternalLinkIcon } from "@/components/ui/icons-extended";
import { SparklesIcon } from "@/components/ui/icon";
import { PROFILE_VISIBILITIES, PUBLIC_SECTIONS, type ProfileVisibility, type PublicSection } from "@/lib/profile/public-config";
import type { PublicProfileSettingsData } from "./queries";
import { regenerateProfileSummary, toggleProfileSection, updateProfileVisibility } from "./actions";
import { ProfileQRCode } from "./components/profile-qr";

function Toggle({ checked, disabled, onChange, label }: { checked: boolean; disabled?: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border py-2.5 first:border-t-0">
      <span className="text-sm">{label}</span>
      <button
        type="button" role="switch" aria-checked={checked} aria-label={label} disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors", checked ? "bg-primary" : "bg-foreground/15", disabled && "opacity-60")}
      >
        <span className={cn("inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform", checked ? "translate-x-[22px]" : "translate-x-0.5")} />
      </button>
    </div>
  );
}

export function PublicProfileSettings({ data }: { data: PublicProfileSettingsData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [visibility, setVisibility] = useState<ProfileVisibility>(data.visibility);
  const [sections, setSections] = useState<Record<PublicSection, boolean>>(data.sections);
  const [copied, setCopied] = useState(false);
  const [summaryMsg, setSummaryMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const copy = async () => {
    try { await navigator.clipboard.writeText(data.profileUrl); } catch { /* blocked */ }
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const changeVisibility = (v: ProfileVisibility) => {
    setError(null);
    setVisibility(v);
    startTransition(async () => {
      const res = await updateProfileVisibility(v);
      if (!res.ok) { setVisibility(data.visibility); setError(res.error); } else router.refresh();
    });
  };

  const changeSection = (key: PublicSection) => (val: boolean) => {
    setError(null);
    setSections((s) => ({ ...s, [key]: val }));
    startTransition(async () => {
      const res = await toggleProfileSection(key, val);
      if (!res.ok) { setSections((s) => ({ ...s, [key]: !val })); setError(res.error); } else router.refresh();
    });
  };

  const regenerate = () => {
    setError(null); setSummaryMsg(null);
    startTransition(async () => {
      const res = await regenerateProfileSummary();
      if (!res.ok) setError(res.error);
      else { setSummaryMsg(res.source === "ai" ? "AI summary updated." : "Summary updated (offline)."); router.refresh(); }
    });
  };

  return (
    <Card className="space-y-5">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><LinkIcon size={16} /></span>
        <div>
          <h2 className="font-semibold tracking-tight">Public profile</h2>
          <p className="text-sm text-muted">Your shareable career portfolio at a public link.</p>
        </div>
      </div>

      {/* Link */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background p-3">
        <span className="min-w-0 flex-1 truncate font-mono text-sm">{data.profileUrl}</span>
        <Button size="sm" variant="outline" onClick={copy}>{copied ? "Copied" : "Copy"}</Button>
        <a href={data.profilePath} target="_blank" rel="noopener noreferrer" className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border px-3 text-sm font-medium transition-colors hover:bg-foreground/5">
          <ExternalLinkIcon size={15} /> View
        </a>
      </div>

      {/* QR code */}
      <ProfileQRCode url={data.profileUrl} name={data.username} username={data.username} visibility={visibility} />

      {/* Visibility */}
      <div>
        <p className="mb-2 text-sm font-medium">Who can see it</p>
        <div className="grid gap-2 sm:grid-cols-3">
          {PROFILE_VISIBILITIES.map((v) => (
            <button
              key={v.value} type="button" disabled={pending} onClick={() => changeVisibility(v.value)}
              className={cn("rounded-xl border p-3 text-left transition-colors", visibility === v.value ? "border-primary bg-primary/5" : "border-border hover:bg-foreground/5")}
            >
              <span className="flex items-center justify-between">
                <span className="text-sm font-semibold">{v.label}</span>
                {visibility === v.value && <Badge variant="primary">On</Badge>}
              </span>
              <span className="mt-1 block text-xs text-muted">{v.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border p-3">
        <div>
          <p className="text-sm font-medium">AI career summary</p>
          <p className="text-xs text-muted">{summaryMsg ?? (data.hasAiSummary ? "A generated summary is shown on your profile." : "Generate a recruiter-facing summary.")}</p>
        </div>
        <Button size="sm" variant="outline" onClick={regenerate} disabled={pending}><SparklesIcon size={15} /> {data.hasAiSummary ? "Regenerate" : "Generate"}</Button>
      </div>

      {/* Section toggles */}
      <div>
        <p className="mb-1 text-sm font-medium">Sections to show</p>
        <div>
          {PUBLIC_SECTIONS.map((sec) => (
            <Toggle key={sec.key} checked={sections[sec.key]} disabled={pending} onChange={changeSection(sec.key)} label={sec.label} />
          ))}
        </div>
      </div>

      {/* Private stats */}
      <div>
        <p className="mb-2 text-sm font-medium">Your private stats</p>
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Profile views" value={data.stats.views} />
          <Stat label="Resume downloads" value={data.stats.resumeDownloads} />
          <Stat label="Shares" value={data.stats.shares} />
        </div>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-3 text-center">
      <p className="text-xl font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
