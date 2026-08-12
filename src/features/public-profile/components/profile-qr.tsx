"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { DownloadIcon, ExternalLinkIcon } from "@/components/ui/icons-extended";
import { qrMatrix } from "@/lib/qr/qrcode";
import type { ProfileVisibility } from "@/lib/profile/public-config";
import { buildShareLinks } from "@/lib/profile/public-config";
import { recordProfileShare } from "../actions";

const DARK = "#0b1220";
const LIGHT = "#ffffff";

/** Functional, branded QR for the public profile. Dark-on-white for scannability. */
export function ProfileQRCode({
  url,
  name,
  username,
  visibility,
}: {
  url: string;
  name: string;
  username: string;
  visibility: ProfileVisibility;
}) {
  const [copied, setCopied] = useState(false);
  const enabled = visibility !== "private";

  const matrix = useMemo(() => (enabled ? qrMatrix(url, "M") : null), [url, enabled]);

  if (!enabled || !matrix) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-background p-6 text-center">
        <p className="text-sm font-medium">Your QR code is hidden</p>
        <p className="mt-1 text-xs text-muted">
          Set your profile to Unlisted or Public to generate a shareable QR code.
        </p>
      </div>
    );
  }

  const n = matrix.length;
  const quiet = 4;
  const dim = n + quiet * 2;

  // Build the module path once (fast, crisp).
  let path = "";
  for (let y = 0; y < n; y++) {
    for (let x = 0; x < n; x++) {
      if (matrix[y][x]) path += `M${x + quiet},${y + quiet}h1v1h-1z`;
    }
  }

  const downloadPng = () => {
    const scale = 12;
    const px = dim * scale;
    const canvas = document.createElement("canvas");
    canvas.width = px;
    canvas.height = px;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = LIGHT;
    ctx.fillRect(0, 0, px, px);
    ctx.fillStyle = DARK;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if (matrix[y][x]) ctx.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
      }
    }
    const link = document.createElement("a");
    link.download = `careerverse-${username || "profile"}-qr.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      /* clipboard may be blocked */
    }
    setCopied(true);
    void recordProfileShare(username);
    setTimeout(() => setCopied(false), 1600);
  };

  const share = async () => {
    void recordProfileShare(username);
    const nav = navigator as Navigator & { share?: (d: { title: string; url: string }) => Promise<void> };
    if (typeof nav.share === "function") {
      try {
        await nav.share({ title: `${name} · CareerVerse`, url });
        return;
      } catch {
        /* user cancelled or unsupported — fall through */
      }
    }
    window.open(buildShareLinks(url, name).linkedin, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
      <div className="rounded-2xl border border-border bg-white p-3 shadow-sm">
        <svg
          width={160}
          height={160}
          viewBox={`0 0 ${dim} ${dim}`}
          shapeRendering="crispEdges"
          role="img"
          aria-label={`QR code linking to ${name}'s public CareerVerse profile`}
        >
          <rect width={dim} height={dim} fill={LIGHT} />
          <path d={path} fill={DARK} />
        </svg>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        <p className="text-sm text-muted">Scan to open your public profile, or share it directly.</p>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={downloadPng}>
            <DownloadIcon size={15} /> Download PNG
          </Button>
          <Button size="sm" variant="outline" onClick={copyLink}>
            {copied ? "Copied" : "Copy link"}
          </Button>
          <Button size="sm" variant="outline" onClick={share}>
            <ExternalLinkIcon size={15} /> Share
          </Button>
        </div>
      </div>
    </div>
  );
}
