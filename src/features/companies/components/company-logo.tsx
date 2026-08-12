"use client";

import { useState } from "react";
import { logoUrl } from "@/lib/companies/links";
import { cn } from "@/lib/utils";

/** Self-authored generic building glyph — the clean fallback when no logo loads. */
function BuildingGlyph({ size = 24 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 21h18" />
      <path d="M5 21V6a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15" />
      <path d="M14 21V10a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v11" />
      <path d="M8 8h2M8 11h2M8 14h2" />
      <path d="M17 12v.01M17 15v.01" />
    </svg>
  );
}

/**
 * Official company logo with a clean generic fallback.
 *
 * Logos are fetched at runtime from a logo service keyed on the company domain
 * (no brand artwork is bundled in the repo). A white tile keeps full-color logos
 * legible in both light and dark themes; if the logo can't load we show a
 * brand-tinted building glyph — never text initials.
 */
export function CompanyLogo({
  name,
  domain,
  brand,
  size = 56,
  className,
  rounded = "rounded-2xl",
}: {
  name: string;
  domain?: string | null;
  brand: string;
  size?: number;
  className?: string;
  rounded?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImg = Boolean(domain) && !failed;

  return (
    <span
      className={cn("relative grid shrink-0 place-items-center overflow-hidden shadow-sm", rounded, className)}
      style={{
        width: size,
        height: size,
        background: showImg ? "#ffffff" : `color-mix(in srgb, ${brand} 90%, #000)`,
      }}
    >
      {showImg ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl(domain as string)}
          alt={`${name} logo`}
          width={size}
          height={size}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-contain p-2"
        />
      ) : (
        <span className="text-white" style={{ opacity: 0.95 }}>
          <BuildingGlyph size={Math.round(size * 0.42)} />
        </span>
      )}
    </span>
  );
}
