"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type { Career } from "@/lib/careers/types";
import type { CareersListData } from "../queries";
import { toggleFavoriteCareer } from "../actions";
import { CareerCard } from "./career-card";
import { CareerFiltersPanel } from "./career-filters-panel";
import type { Currency } from "../format";
import {
  type CareerFilters,
  EMPTY_FILTERS,
  activeFilterCount,
  matchesFilters,
  matchesQuery,
  topicMatches,
  topicsWithCounts,
  SALARY_BUCKETS,
} from "../filters";
import { useDebouncedValue, useRecentlyViewed } from "../explorer-hooks";
import { SectionHeading } from "@/components/shared/state-panels";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SearchIcon, XIcon } from "@/components/ui/icon";
import { FilterIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

/** Human labels for active-filter chips. */
function filterChipLabel(key: keyof CareerFilters, value: string): string {
  if (key === "salary") return SALARY_BUCKETS.find((b) => b.key === value)?.label ?? value;
  return value;
}

export function CareerExplorer({ data }: { data: CareersListData }) {
  const [rawQuery, setRawQuery] = useState("");
  const query = useDebouncedValue(rawQuery, 200);

  const [topic, setTopic] = useState("all");
  const [filters, setFilters] = useState<CareerFilters>(EMPTY_FILTERS);
  const [savedOnly, setSavedOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currency, setCurrency] = useState<Currency>("INR");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(data.favoriteSlugs.map((slug) => [slug, true])),
  );

  const { slugs: recentSlugs, record } = useRecentlyViewed();
  const bySlug = useMemo(() => new Map(data.careers.map((c) => [c.slug, c])), [data.careers]);
  const topicChips = useMemo(() => topicsWithCounts(data.careers), [data.careers]);
  const activeCount = activeFilterCount(filters) + (topic !== "all" ? 1 : 0) + (savedOnly ? 1 : 0);

  async function handleToggleFavorite(slug: string) {
    const next = !favorites[slug];
    setFavorites((prev) => ({ ...prev, [slug]: next }));
    setError(null);
    const result = await toggleFavoriteCareer({ slug, favorite: next });
    if (!result.ok) {
      setFavorites((prev) => ({ ...prev, [slug]: !next }));
      setError(result.error);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.careers.filter((c) => {
      if (savedOnly && !favorites[c.slug]) return false;
      if (!topicMatches(c, topic)) return false;
      if (!matchesFilters(c, filters)) return false;
      if (q && !matchesQuery(c, q)) return false;
      return true;
    });
  }, [data.careers, favorites, query, topic, filters, savedOnly]);

  // Reset progressive rendering whenever the result set changes.
  const filterSignature = JSON.stringify({ query, topic, filters, savedOnly });
  useEffect(() => {
    setVisible(PAGE_SIZE);
  }, [filterSignature]);

  const shown = filtered.slice(0, visible);
  const recentCareers = recentSlugs
    .map((slug) => bySlug.get(slug))
    .filter((c): c is Career => Boolean(c));

  function patchFilters(patch: Partial<CareerFilters>) {
    setFilters((prev) => ({ ...prev, ...patch }));
  }

  function clearAll() {
    setRawQuery("");
    setTopic("all");
    setFilters(EMPTY_FILTERS);
    setSavedOnly(false);
  }

  const activeFilterEntries = (Object.entries(filters) as [keyof CareerFilters, string][]).filter(
    ([, v]) => v !== "all",
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      <SectionHeading
        title="Explore Careers"
        description={`Search and filter ${data.careers.length}+ careers by skills, salary, demand, and more.`}
        action={
          <Link
            href={ROUTES.compare}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium text-muted transition-colors hover:bg-foreground/5"
          >
            Compare careers
          </Link>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}

      {/* Recently viewed */}
      {recentCareers.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Recently viewed</h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentCareers.map((career) => (
              <Link
                key={career.slug}
                href={`/careers/${career.slug}`}
                onClick={() => record(career.slug)}
                className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-primary/40 hover:text-foreground"
              >
                {career.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Search + filter toggle */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          />
          <Input
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            placeholder="Search by name, skill, or industry…"
            aria-label="Search careers"
            className="pl-9 pr-9"
          />
          {rawQuery && (
            <button
              type="button"
              onClick={() => setRawQuery("")}
              aria-label="Clear search"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-subtle transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <XIcon size={15} />
            </button>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          aria-expanded={showFilters}
          className={cn(
            "inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium transition-colors",
            showFilters || activeCount > 0
              ? "border-primary/40 bg-primary/5 text-primary"
              : "border-border text-muted hover:bg-foreground/5",
          )}
        >
          <FilterIcon size={16} />
          Filters
          {activeCount > 0 && (
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-semibold text-primary-foreground tabular-nums">
              {activeCount}
            </span>
          )}
        </button>
      </div>

      {/* Category / topic chips */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTopic("all")}
          aria-pressed={topic === "all"}
          className={cn(
            "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
            topic === "all"
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted hover:border-foreground/25 hover:text-foreground",
          )}
        >
          All
        </button>
        {topicChips.map(({ topic: t, count }) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTopic((cur) => (cur === t.key ? "all" : t.key))}
            aria-pressed={topic === t.key}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              topic === t.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted hover:border-foreground/25 hover:text-foreground",
            )}
          >
            {t.label}
            <span className="ml-1.5 text-subtle tabular-nums">{count}</span>
          </button>
        ))}
      </div>

      {/* Smart filters panel */}
      {showFilters && (
        <CareerFiltersPanel
          filters={filters}
          onChange={patchFilters}
          savedOnly={savedOnly}
          onToggleSaved={() => setSavedOnly((v) => !v)}
        />
      )}

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {topic !== "all" && (
            <ActiveChip label={topicChips.find((t) => t.topic.key === topic)?.topic.label ?? topic} onRemove={() => setTopic("all")} />
          )}
          {savedOnly && <ActiveChip label="Saved only" onRemove={() => setSavedOnly(false)} />}
          {activeFilterEntries.map(([key, value]) => (
            <ActiveChip key={key} label={filterChipLabel(key, value)} onRemove={() => patchFilters({ [key]: "all" })} />
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Result count + currency toggle */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted tabular-nums">
          {filtered.length} {filtered.length === 1 ? "career" : "careers"}
        </p>
        <div
          className="inline-flex items-center rounded-md border border-border p-0.5 text-xs font-medium"
          role="group"
          aria-label="Salary currency"
        >
          <button
            type="button"
            onClick={() => setCurrency("INR")}
            aria-pressed={currency === "INR"}
            className={cn(
              "rounded px-2.5 py-1 transition-colors",
              currency === "INR" ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground",
            )}
          >
            ₹ INR
          </button>
          <button
            type="button"
            onClick={() => setCurrency("USD")}
            aria-pressed={currency === "USD"}
            className={cn(
              "rounded px-2.5 py-1 transition-colors",
              currency === "USD" ? "bg-primary/10 text-primary" : "text-muted hover:text-foreground",
            )}
          >
            $ USD
          </button>
        </div>
      </div>

      {/* Results grid (progressive) */}
      {shown.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((career) => (
              <CareerCard
                key={career.slug}
                career={career}
                favorited={Boolean(favorites[career.slug])}
                onToggleFavorite={() => handleToggleFavorite(career.slug)}
                onView={() => record(career.slug)}
                currency={currency}
              />
            ))}
          </div>
          {visible < filtered.length && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
                Load more ({filtered.length - visible} left)
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-14 text-center">
          <p className="text-sm text-muted">
            {savedOnly
              ? "You haven't saved any matching careers yet."
              : "No careers match your search and filters."}
          </p>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="mt-3 text-sm font-medium text-primary hover:underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function ActiveChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-primary/25 bg-primary/10 py-1 pl-2.5 pr-1 text-xs font-medium text-primary">
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="rounded-full p-0.5 transition-colors hover:bg-primary/20"
      >
        <XIcon size={12} />
      </button>
    </span>
  );
}
