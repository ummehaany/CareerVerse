"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { LearningPageData } from "../queries";
import type { LearningFilters, LearningResourceView, SortKey } from "../types";
import { DEFAULT_FILTERS, queryResources } from "../service/query";
import { toggleBookmark } from "../actions";
import { ResourceCard } from "./resource-card";
import { SectionHeading } from "@/components/shared/state-panels";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { SearchIcon, SparklesIcon } from "@/components/ui/icon";
import { FilterIcon } from "@/components/ui/icons-extended";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 12;

const SORT_OPTIONS: Array<{ value: SortKey; label: string }> = [
  { value: "relevance", label: "Best match" },
  { value: "rating", label: "Highest rated" },
  { value: "newest", label: "Newest" },
  { value: "title", label: "A–Z" },
];

export function LearningHub({ data }: { data: LearningPageData }) {
  const [filters, setFilters] = useState<LearningFilters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("relevance");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [error, setError] = useState<string | null>(null);

  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(data.resources.map((r) => [r.id, r.bookmarked])),
  );

  const recommendedSet = useMemo(() => new Set(data.recommendedIds), [data.recommendedIds]);

  const setFilter = useCallback(
    <K extends keyof LearningFilters>(key: K, value: LearningFilters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const clearFilters = useCallback(() => setFilters(DEFAULT_FILTERS), []);

  async function handleToggle(id: string) {
    const next = !bookmarks[id];
    setBookmarks((prev) => ({ ...prev, [id]: next }));
    setError(null);
    const result = await toggleBookmark({ resourceId: id, bookmarked: next });
    if (!result.ok) {
      setBookmarks((prev) => ({ ...prev, [id]: !next }));
      setError(result.error);
    }
  }

  // Merge live (optimistic) bookmark state onto the server-ranked resources.
  const viewResources = useMemo<LearningResourceView[]>(
    () => data.resources.map((r) => ({ ...r, bookmarked: bookmarks[r.id] ?? r.bookmarked })),
    [data.resources, bookmarks],
  );

  const isFiltering = useMemo(
    () =>
      filters.search.trim() !== "" ||
      filters.savedOnly ||
      filters.career !== "" ||
      filters.skill !== "" ||
      filters.difficulty !== "" ||
      filters.category !== "" ||
      filters.provider !== "" ||
      filters.resourceType !== "" ||
      filters.pricing !== "" ||
      filters.duration !== "",
    [filters],
  );

  // Filter + sort the entire dataset (memoized — recomputes only on real change).
  const { items: matched, total } = useMemo(
    () => queryResources(viewResources, filters, sort),
    [viewResources, filters, sort],
  );

  // Reset the infinite-scroll window whenever the result set changes.
  const filterKey = JSON.stringify(filters) + sort;
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filterKey]);

  const visible = useMemo(() => matched.slice(0, visibleCount), [matched, visibleCount]);
  const hasMore = visibleCount < matched.length;

  // Infinite scroll via IntersectionObserver — no scroll listeners, minimal work.
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisibleCount((v) => Math.min(v + PAGE_SIZE, matched.length));
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, matched.length]);

  const recommended = useMemo(
    () => viewResources.filter((r) => recommendedSet.has(r.id)),
    [viewResources, recommendedSet],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      <SectionHeading
        title="Learning Hub"
        description="A curated library of high-quality resources, personalized to your goals."
      />

      {error && <Alert variant="error">{error}</Alert>}

      {!isFiltering && recommended.length > 0 && (
        <section className="space-y-3">
          <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
            <SparklesIcon size={14} className="text-primary" />
            Recommended for you
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {recommended.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                recommended
                bookmarked={Boolean(bookmarks[resource.id])}
                onToggleBookmark={() => handleToggle(resource.id)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Search + sort */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          />
          <Input
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
            placeholder="Search by title, skill, provider, career…"
            aria-label="Search resources"
            className="pl-9"
          />
        </div>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sort resources"
          className="sm:w-44"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </div>

      {/* Filters */}
      <div className="space-y-3 rounded-xl border border-border bg-foreground/[0.02] p-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
            <FilterIcon size={13} />
            Filters
          </span>
          {isFiltering && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs font-medium text-primary hover:underline"
            >
              Clear all
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          <FilterSelect
            label="Career"
            value={filters.career}
            onChange={(v) => setFilter("career", v)}
            options={data.facets.careers}
          />
          <FilterSelect
            label="Skill"
            value={filters.skill}
            onChange={(v) => setFilter("skill", v)}
            options={data.facets.skills}
          />
          <FilterSelect
            label="Difficulty"
            value={filters.difficulty}
            onChange={(v) => setFilter("difficulty", v)}
            options={data.facets.difficulties}
          />
          <FilterSelect
            label="Category"
            value={filters.category}
            onChange={(v) => setFilter("category", v)}
            options={data.facets.categories}
          />
          <FilterSelect
            label="Type"
            value={filters.resourceType}
            onChange={(v) => setFilter("resourceType", v)}
            options={data.facets.resourceTypes}
          />
          <FilterSelect
            label="Provider"
            value={filters.provider}
            onChange={(v) => setFilter("provider", v)}
            options={data.facets.providers}
          />
          <FilterSelect
            label="Price"
            value={filters.pricing}
            onChange={(v) => setFilter("pricing", v)}
            options={data.facets.pricing}
          />
          <FilterSelect
            label="Duration"
            value={filters.duration}
            onChange={(v) => setFilter("duration", v)}
            options={data.facets.durations}
          />
        </div>
        <button
          type="button"
          onClick={() => setFilter("savedOnly", !filters.savedOnly)}
          aria-pressed={filters.savedOnly}
          className={cn(
            "h-9 rounded-md border px-4 text-sm font-medium transition-colors",
            filters.savedOnly
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted hover:bg-foreground/5",
          )}
        >
          Saved only
        </button>
      </div>

      <p className="text-xs text-subtle" aria-live="polite">
        {total} {total === 1 ? "resource" : "resources"}
        {isFiltering ? " match your filters" : " available"}
      </p>

      {visible.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((resource) => (
              <ResourceCard
                key={resource.id}
                resource={resource}
                recommended={recommendedSet.has(resource.id)}
                bookmarked={Boolean(bookmarks[resource.id])}
                onToggleBookmark={() => handleToggle(resource.id)}
              />
            ))}
          </div>
          {hasMore && <div ref={sentinelRef} aria-hidden="true" className="h-8" />}
        </>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-14 text-center">
          <p className="text-sm text-muted">
            {filters.savedOnly
              ? "You haven't saved any matching resources yet."
              : "No resources match your filters."}
          </p>
        </div>
      )}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onChange={(e) => onChange(e.target.value)} aria-label={`Filter by ${label}`}>
      <option value="">{label}: All</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </Select>
  );
}
