"use client";

import { useState } from "react";
import { DownloadIcon } from "@/components/ui/icons-extended";
import type { ProfilePageData } from "../types";

/**
 * Client-side "Export Career Profile" — serializes the profile to a downloadable
 * JSON file. No backend needed; a future export endpoint can reuse this shape.
 */
export function ExportProfileButton({ data }: { data: ProfilePageData }) {
  const [done, setDone] = useState(false);

  function exportProfile() {
    const payload = {
      generatedAt: new Date().toISOString(),
      source: "CareerVerse",
      identity: {
        name: data.identity.name,
        username: data.identity.username,
        email: data.identity.email,
        plan: data.identity.plan,
        role: data.identity.role,
        publicUrl: data.identity.publicUrl,
        joined: data.identity.joined,
      },
      career: data.career,
      statistics: data.stats,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `careerverse-profile-${data.identity.username}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setDone(true);
    window.setTimeout(() => setDone(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={exportProfile}
      className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <DownloadIcon size={17} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium">{done ? "Exported!" : "Export Career Profile"}</span>
        <span className="block truncate text-xs text-muted">Download as JSON</span>
      </span>
    </button>
  );
}
