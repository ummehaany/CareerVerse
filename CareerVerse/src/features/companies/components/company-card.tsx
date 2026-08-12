"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { MapPinIcon } from "@/components/ui/icons-extended";
import { ArrowRightIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { CompanyCardData } from "../types";
import { CompanyLogo } from "./company-logo";

function DifficultyDots({ level, brand }: { level: number; brand: string }) {
  return (
    <span className="inline-flex items-center gap-1" aria-label={`Selectivity ${level} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: i <= level ? brand : "color-mix(in srgb, var(--foreground) 15%, transparent)" }}
        />
      ))}
    </span>
  );
}

export function CompanyCard({ company }: { company: CompanyCardData }) {
  return (
    <Link
      href={`${ROUTES.companies}/${company.slug}`}
      style={{ ["--brand"]: company.brand } as React.CSSProperties}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl border border-border",
        "bg-background/70 backdrop-blur-xl transition-all duration-300",
        "hover:-translate-y-1 hover:border-[color-mix(in_srgb,var(--brand)_45%,var(--border))]",
        "hover:shadow-[0_24px_50px_-20px_color-mix(in_srgb,var(--brand)_60%,transparent)]",
      )}
    >
      {/* ambient brand glow, revealed on hover */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-20 h-44 w-44 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "color-mix(in srgb, var(--brand) 40%, transparent)" }}
      />
      {/* brand gradient header */}
      <div
        className="relative h-16"
        style={{
          background:
            "linear-gradient(135deg, color-mix(in srgb, var(--brand) 55%, transparent), color-mix(in srgb, var(--brand) 12%, transparent))",
        }}
      >
        <span className="absolute -bottom-7 left-5">
          <CompanyLogo name={company.name} domain={company.domain} brand={company.brand} size={56} className="ring-2 ring-background" />
        </span>
      </div>

      <div className="relative flex flex-1 flex-col gap-3 p-5 pt-9">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="truncate font-semibold tracking-tight">{company.name}</h3>
            <p className="truncate text-xs text-muted">{company.industry}</p>
          </div>
          <Badge variant="muted" className="shrink-0">{company.category}</Badge>
        </div>

        <p className="line-clamp-2 text-sm text-muted">{company.tagline}</p>

        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-subtle">
          <span className="inline-flex min-w-0 items-center gap-1">
            <MapPinIcon size={13} />
            <span className="truncate">{company.hq}</span>
          </span>
          <DifficultyDots level={company.difficulty} brand={company.brand} />
        </div>

        {/* footer: role count + View Profile */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="text-xs font-medium text-muted">{company.roleCount} roles</span>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-semibold",
              "text-foreground transition-all duration-300",
              "group-hover:border-transparent group-hover:bg-[var(--brand)] group-hover:text-white",
            )}
          >
            View Profile
            <ArrowRightIcon size={13} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
