"use client";

import { useMemo, useState } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { SearchIcon, RocketIcon } from "@/components/ui/icon";
import type { CompaniesHomeData } from "../types";
import { CompanyCard } from "./company-card";
import { CompanyDashboard } from "./company-dashboard";

export function CompaniesHome({ data }: { data: CompaniesHomeData }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("All");

  const filters = useMemo(() => ["All", ...data.categories], [data.categories]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.companies.filter((c) => {
      if (category !== "All" && c.category !== category) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.hq.toLowerCase().includes(q) ||
        c.tagline.toLowerCase().includes(q)
      );
    });
  }, [data.companies, query, category]);

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-fade-up">
      <PageHeader
        title="Target Companies"
        description="Explore top employers, see exactly what it takes to get in, and measure yourself against their bar."
      />

      <CompanyDashboard data={data.dashboard} />

      {/* search + filters */}
      <div className="space-y-3">
        <div className="relative">
          <SearchIcon size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search companies by name, industry, or location…"
            className="pl-9"
            aria-label="Search companies"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((f) => {
            const active = category === f;
            return (
              <button
                key={f}
                type="button"
                onClick={() => setCategory(f)}
                aria-pressed={active}
                className={
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors " +
                  (active
                    ? "border-transparent bg-foreground text-background"
                    : "border-border bg-background text-muted hover:border-foreground/20 hover:text-foreground")
                }
              >
                {f}
              </button>
            );
          })}
        </div>
      </div>

      {/* grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-border py-16 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <RocketIcon size={26} />
          </span>
          <div className="space-y-1">
            <p className="font-medium">No companies match your search</p>
            <p className="mx-auto max-w-sm text-sm text-muted">
              Try a different name, industry, or clear the filters.
            </p>
          </div>
        </div>
      ) : (
        <>
          <p className="text-xs text-subtle">
            {filtered.length} {filtered.length === 1 ? "company" : "companies"}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((company) => (
              <CompanyCard key={company.slug} company={company} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
