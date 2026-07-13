"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { CareersListData } from "../queries";
import { toggleFavoriteCareer } from "../actions";
import { CareerCard } from "./career-card";
import { SectionHeading } from "@/components/shared/state-panels";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";
import { SearchIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export function CareerExplorer({ data }: { data: CareersListData }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [savedOnly, setSavedOnly] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(data.favoriteSlugs.map((slug) => [slug, true])),
  );

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
      if (category !== "all" && c.category !== category) return false;
      if (q) {
        const haystack = `${c.title} ${c.tagline} ${c.category} ${c.skills.join(" ")}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [data.careers, favorites, query, category, savedOnly]);

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      <SectionHeading
        title="Explore Careers"
        description={`Browse ${data.careers.length}+ careers with skills, salary, demand, and AI insights.`}
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-subtle"
          />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search careers or skills…"
            aria-label="Search careers"
            className="pl-9"
          />
        </div>
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          className="sm:w-56"
        >
          <option value="all">All categories</option>
          {data.categories.map((c) => (
            <option key={c} value={c}>
              {c}
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

      <p className="text-sm text-muted">{filtered.length} careers</p>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((career) => (
            <CareerCard
              key={career.slug}
              career={career}
              favorited={Boolean(favorites[career.slug])}
              onToggleFavorite={() => handleToggleFavorite(career.slug)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border py-14 text-center">
          <p className="text-sm text-muted">
            {savedOnly ? "You haven't saved any matching careers yet." : "No careers match your search."}
          </p>
        </div>
      )}
    </div>
  );
}
