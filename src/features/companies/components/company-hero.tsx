"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRightIcon, DollarIcon, GlobeIcon, LayersIcon, UsersIcon } from "@/components/ui/icon";
import { MapPinIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import type { CompanyProfile } from "../types";
import { SaveButtons } from "./save-buttons";
import { CompanyLogo } from "./company-logo";
import { getCareersUrl, getCompanyDomain } from "@/lib/companies/links";

export function CompanyHero({
  profile,
  isSaved,
  isDream,
  readinessScore,
}: {
  profile: CompanyProfile;
  isSaved: boolean;
  isDream: boolean;
  readinessScore: number;
}) {
  const { record, roles, salaryRange } = profile;
  const careersUrl = getCareersUrl(record.slug);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-border p-6 sm:p-8"
      style={{
        background: `linear-gradient(135deg, color-mix(in srgb, ${record.brand} 24%, var(--background)) 0%, var(--background) 65%)`,
      }}
    >
      {/* soft glass orb */}
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
        style={{ background: `color-mix(in srgb, ${record.brand} 30%, transparent)` }}
        aria-hidden="true"
      />

      <div className="relative">
        <Link
          href={ROUTES.companies}
          className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          <ArrowRightIcon size={13} className="rotate-180" />
          All companies
        </Link>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <CompanyLogo name={record.name} domain={getCompanyDomain(record.slug)} brand={record.brand} size={64} />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{record.name}</h1>
              <p className="mt-1 text-sm text-muted sm:text-base">{record.tagline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-subtle">
                <span>{record.industry}</span>
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon size={12} /> {record.hq}
                </span>
                <span>Founded {record.founded}</span>
                <span className="inline-flex items-center gap-1">
                  <UsersIcon size={12} /> {record.size}
                </span>
              </div>
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            {careersUrl && (
              <a
                href={careersUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-transform hover:-translate-y-0.5"
                style={{ background: record.brand }}
              >
                <GlobeIcon size={16} /> Official Careers
              </a>
            )}
            <SaveButtons slug={record.slug} initialSaved={isSaved} initialDream={isDream} />
          </div>
        </div>

        {/* quick stats */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat icon={<LayersIcon size={15} />} label="Open role types" value={`${roles.length}`} />
          <Stat icon={<DollarIcon size={15} />} label="Salary (approx.)" value={salaryRange.label} />
          <Stat
            icon={<span className="text-xs font-bold">{readinessScore}</span>}
            label="Your readiness"
            value={`${readinessScore}%`}
          />
          <Stat
            icon={<span className="text-xs font-bold">{record.difficulty}/5</span>}
            label="Selectivity"
            value={record.difficulty >= 4 ? "Very high" : record.difficulty >= 3 ? "High" : "Moderate"}
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background/70 p-3 backdrop-blur-sm">
      <div className="flex items-center gap-1.5 text-muted">
        <span className="grid h-6 w-6 place-items-center rounded-md bg-primary/10 text-primary">{icon}</span>
        <span className="text-[11px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1.5 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}
