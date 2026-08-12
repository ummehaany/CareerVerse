"use client";

import { useCallback, useEffect, useState } from "react";

/** Debounce any fast-changing value (e.g. a search box) for instant-but-cheap search. */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const RECENT_KEY = "cv:recently-viewed-careers";
const RECENT_MAX = 8;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : [];
  } catch {
    return [];
  }
}

/** Persist a viewed career slug (most-recent first, de-duped, capped). Safe on server. */
export function pushRecentlyViewed(slug: string): void {
  if (typeof window === "undefined") return;
  try {
    const next = [slug, ...readRecent().filter((s) => s !== slug)].slice(0, RECENT_MAX);
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable — recently-viewed is a best-effort convenience
  }
}

/** Reactive recently-viewed slugs for the Explorer, plus a recorder. */
export function useRecentlyViewed(): { slugs: string[]; record: (slug: string) => void } {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    setSlugs(readRecent());
  }, []);

  const record = useCallback((slug: string) => {
    pushRecentlyViewed(slug);
    setSlugs(readRecent());
  }, []);

  return { slugs, record };
}
