"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ComponentType, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import type { IconProps } from "@/components/ui/icon";
import {
  SearchIcon,
  XIcon,
  ChevronRightIcon,
  CompassIcon,
  GlobeIcon,
  TargetIcon,
  RouteIcon,
  FileTextIcon,
  MicIcon,
  SparklesIcon,
  PuzzleIcon,
  RocketIcon,
  ChartIcon,
  ClockIcon,
  CodeIcon,
  BookIcon,
  TrendingUpIcon,
} from "@/components/ui/icon";
import { AwardIcon } from "@/components/ui/icons-extended";
import {
  searchContent,
  trendingCareers,
  SUGGESTED_QUERIES,
  type SearchItem,
} from "@/features/search/content";
import { cn } from "@/lib/utils";

const ICONS: Record<string, ComponentType<IconProps>> = {
  compass: CompassIcon,
  globe: GlobeIcon,
  target: TargetIcon,
  route: RouteIcon,
  file: FileTextIcon,
  mic: MicIcon,
  sparkles: SparklesIcon,
  puzzle: PuzzleIcon,
  rocket: RocketIcon,
  chart: ChartIcon,
  clock: ClockIcon,
  code: CodeIcon,
  book: BookIcon,
  award: AwardIcon,
  search: SearchIcon,
};

const RECENT_KEY = "cv:recent-searches";
const RECENT_MAX = 6;

function readRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string").slice(0, RECENT_MAX) : [];
  } catch {
    return [];
  }
}

function writeRecent(list: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}

function ResultRow({
  item,
  active,
  onHover,
  onSelect,
}: {
  item: SearchItem;
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}) {
  const Icon = ICONS[item.icon] ?? SearchIcon;
  return (
    <button
      type="button"
      onMouseEnter={onHover}
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-colors",
        active ? "bg-primary/10" : "hover:bg-foreground/5",
      )}
    >
      <span className={cn("grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors", active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
        <Icon size={16} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{item.title}</span>
        <span className="block truncate text-xs text-subtle">{item.subtitle}</span>
      </span>
      <ChevronRightIcon size={15} className={cn("shrink-0 transition-all", active ? "translate-x-0 text-primary opacity-100" : "-translate-x-1 text-subtle opacity-0")} />
    </button>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const trimmed = query.trim();
  const groups = useMemo(() => searchContent(trimmed), [trimmed]);
  const trending = useMemo(() => trendingCareers(), []);

  // Flat list of keyboard-navigable items for the current view.
  const flat: SearchItem[] = useMemo(
    () => (trimmed ? groups.flatMap((g) => g.items) : trending),
    [trimmed, groups, trending],
  );

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  const remember = useCallback((q: string) => {
    const v = q.trim();
    if (!v) return;
    setRecent((prev) => {
      const next = [v, ...prev.filter((x) => x.toLowerCase() !== v.toLowerCase())].slice(0, RECENT_MAX);
      writeRecent(next);
      return next;
    });
  }, []);

  const select = useCallback(
    (item: SearchItem | undefined) => {
      if (!item) return;
      remember(trimmed || item.title);
      close();
      router.push(item.href);
    },
    [remember, trimmed, close, router],
  );

  // ⌘K / Ctrl+K toggles.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) {
      setRecent(readRecent());
      const t = window.setTimeout(() => inputRef.current?.focus(), 20);
      return () => window.clearTimeout(t);
    }
  }, [open]);

  useEffect(() => setActive(0), [trimmed]);

  function onInputKeyDown(e: ReactKeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, flat.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      select(flat[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  function clearRecent() {
    setRecent([]);
    writeRecent([]);
  }

  // Running index so grouped rows share one keyboard sequence.
  let flatCursor = -1;

  return (
    <>
      {/* Desktop trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-subtle transition-colors hover:border-foreground/20 sm:flex"
        aria-label="Search CareerVerse"
      >
        <SearchIcon size={18} />
        <span>Search careers, skills, companies…</span>
        <kbd className="ml-auto rounded border border-border px-1.5 font-sans text-xs">⌘K</kbd>
      </button>

      {/* Mobile trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5 sm:hidden"
        aria-label="Search"
      >
        <SearchIcon size={20} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 px-4 pt-[10vh] backdrop-blur-sm animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-label="Global search"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div className="cv-search-panel w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
            {/* Input */}
            <div className="flex items-center gap-2 border-b border-border px-4">
              <SearchIcon size={18} className="text-primary" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                placeholder="Search careers, roles, skills, companies…"
                aria-label="Search career content"
                className="flex-1 bg-transparent py-3.5 text-sm outline-none placeholder:text-subtle"
              />
              {query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="rounded-md p-1 text-subtle hover:text-foreground">
                  <XIcon size={15} />
                </button>
              )}
              <button type="button" onClick={close} aria-label="Close search" className="rounded-md border border-border px-1.5 py-0.5 text-[11px] text-subtle hover:text-foreground">
                esc
              </button>
            </div>

            <div className="max-h-[58vh] overflow-y-auto p-2">
              {/* ── Empty state (discovery) ── */}
              {!trimmed && (
                <div className="space-y-4 p-1">
                  {recent.length > 0 && (
                    <div>
                      <div className="flex items-center justify-between px-1.5 pb-1.5">
                        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Recent searches</p>
                        <button type="button" onClick={clearRecent} className="text-xs text-subtle hover:text-foreground">Clear</button>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {recent.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => { setQuery(r); inputRef.current?.focus(); }}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
                          >
                            <ClockIcon size={12} /> {r}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="px-1.5 pb-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">Suggested searches</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUGGESTED_QUERIES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => { setQuery(s); inputRef.current?.focus(); }}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary/40 hover:text-primary"
                        >
                          <SparklesIcon size={12} className="text-primary" /> {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="flex items-center gap-1.5 px-1.5 pb-1 text-xs font-semibold uppercase tracking-wide text-subtle">
                      <TrendingUpIcon size={13} className="text-primary" /> Trending careers
                    </p>
                    <ul className="space-y-0.5">
                      {trending.map((item) => {
                        flatCursor += 1;
                        const idx = flatCursor;
                        return (
                          <li key={item.id}>
                            <ResultRow item={item} active={idx === active} onHover={() => setActive(idx)} onSelect={() => select(item)} />
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}

              {/* ── No results ── */}
              {trimmed && groups.length === 0 && (
                <div className="px-3 py-12 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-foreground/[0.04] text-subtle">
                    <SearchIcon size={22} />
                  </span>
                  <p className="mt-3 text-sm font-medium">No results for &ldquo;{trimmed}&rdquo;</p>
                  <p className="mx-auto mt-1 max-w-xs text-xs text-muted">
                    Try a career, role, skill, certification, company, or interview topic.
                  </p>
                </div>
              )}

              {/* ── Grouped results ── */}
              {trimmed && groups.length > 0 && (
                <div className="space-y-2">
                  {groups.map((g) => (
                    <div key={g.group}>
                      <p className="px-2.5 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wide text-subtle">{g.group}</p>
                      <ul className="space-y-0.5">
                        {g.items.map((item) => {
                          flatCursor += 1;
                          const idx = flatCursor;
                          return (
                            <li key={item.id}>
                              <ResultRow item={item} active={idx === active} onHover={() => setActive(idx)} onSelect={() => select(item)} />
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-subtle">
              <span><kbd className="rounded border border-border px-1">↑</kbd> <kbd className="rounded border border-border px-1">↓</kbd> navigate</span>
              <span><kbd className="rounded border border-border px-1">↵</kbd> open</span>
              <span className="ml-auto inline-flex items-center gap-1"><SparklesIcon size={12} className="text-primary" /> Career search</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
