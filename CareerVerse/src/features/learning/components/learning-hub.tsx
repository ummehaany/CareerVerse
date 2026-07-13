"use client";

import { useMemo, useState } from "react";
import type { LearningPageData } from "../queries";
import type { ResourceLevel } from "../types";
import { toggleBookmark } from "../actions";
import { ResourceCard } from "./resource-card";
import { SectionHeading } from "@/components/shared/state-panels";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { SearchIcon, SparklesIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const LEVELS: Array<{ value: ResourceLevel | "all-levels"; label: string }> = [
  { value: "all-levels", label: "All levels" },
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
];

export function LearningHub({ data }: { data: LearningPageData }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [level, setLevel] = useState<string>("all-levels");
  const [savedOnly, setSavedOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(data.resources.map((r) => [r.id, r.bookmarked])),
  );

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

  const isFiltering = query.trim() !== "" || category !== "all" || level !== "all-levels" || savedOnly;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return data.resources.filter((r) => {
      if (savedOnly && !bookmarks[r.id]) return false;
      if (category !== "all" && r.category !== category) return false;
      if (level !== "all-levels" && r.level !== level && r.level !== "all") return false;
      if (q) {
        const haystack = `${r.title} ${r.provider} ${r.description} ${r.skills.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [data.resources, bookmarks, query, category, level, savedOnly]);

  const recommended = data.resources.filter((r) => r.recommended);

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
                bookmarked={Boolean(bookmarks[resource.id])}
                onToggleBookmark={() => handleToggle(resource.id)}
              />
            ))}
          </div>
        </section>
      )}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search resources…"
            aria-label="Search resources"
            className="pl-9"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="sm:w-48"
        >
          <option value="all">All categories</option>
          {data.categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          aria-label="Filter by level"
          className="sm:w-40"
        >
          {LEVELS.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={() => setSavedOnly((v) => !v)}
          aria-pressed={savedOnly}
          className={cn(
            "h-10 shrink-0 rounded-md border px-4 text-sm font-medium transition-colors",
            savedOnly
              ? "border-primary bg-primary/10 text-primary"
              : "border-border text-muted hover:bg-foreground/5",
          )}
        >
          Saved
        </button>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource) => (
            <ResourceCard
              key={resource.id}
              resource={resource}
              bookmarked={Boolean(bookmarks[resource.id])}
              onToggleBookmark={() => handleToggle(resource.id)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-14 text-center">
          <p className="text-sm text-muted">
            {savedOnly ? "You haven't saved any matching resources yet." : "No resources match your filters."}
          </p>
        </div>
      )}
    </div>
  );
}
