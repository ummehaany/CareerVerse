"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import {
  BellIcon,
  XIcon,
  TargetIcon,
  MicIcon,
  FileTextIcon,
  RocketIcon,
  ChartIcon,
  PuzzleIcon,
  SparklesIcon,
} from "@/components/ui/icon";
import {
  DEFAULT_NOTIFICATIONS,
  LEGACY_FABRICATED_NOTIFICATION_IDS,
  NOTIFICATIONS_STORAGE_KEY,
  type AppNotification,
} from "@/features/notifications/data";

const ICONS: Record<string, ComponentType<IconProps>> = {
  target: TargetIcon,
  mic: MicIcon,
  file: FileTextIcon,
  rocket: RocketIcon,
  chart: ChartIcon,
  puzzle: PuzzleIcon,
  sparkles: SparklesIcon,
};

export function Notifications() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // Load persisted notifications. No fabricated defaults are seeded — until a
  // real notification event source exists, an empty inbox is the honest state.
  // Also strips any pre-fix fabricated notifications still sitting in a
  // returning user's localStorage, matched by their known legacy IDs only —
  // this never touches genuine notifications from a future real source.
  useEffect(() => {
    let next = DEFAULT_NOTIFICATIONS;
    try {
      const raw = window.localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as unknown;
        if (Array.isArray(parsed)) {
          next = (parsed as AppNotification[]).filter(
            (n) => !LEGACY_FABRICATED_NOTIFICATION_IDS.has(n.id)
          );
        }
      }
    } catch {
      // localStorage unavailable — fall back to empty in memory
    }
    setItems(next);
    setMounted(true);
  }, []);

  // Persist on change.
  useEffect(() => {
    if (!mounted) return;
    try {
      window.localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, mounted]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = items.filter((n) => !n.read).length;

  function markAllRead() {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  }
  function clearAll() {
    setItems([]);
  }
  function dismiss(id: string) {
    setItems((prev) => prev.filter((n) => n.id !== id));
  }
  function openItem(n: AppNotification) {
    setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
    setOpen(false);
    router.push(n.href);
  }

  return (
    <div className="relative" ref={wrapperRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-lg p-2 text-muted transition-colors hover:bg-foreground/5"
        aria-label={`Notifications${mounted && unread > 0 ? `, ${unread} unread` : ""}`}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <BellIcon />
        {mounted && unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 z-50 mt-2 w-[calc(100vw-2rem)] max-w-sm overflow-hidden rounded-2xl border border-border bg-background shadow-2xl animate-fade-up"
          role="menu"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <p className="text-sm font-semibold tracking-tight">Notifications</p>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unread === 0}
              className="text-xs font-medium text-primary transition-opacity hover:underline disabled:opacity-40"
            >
              Mark all read
            </button>
          </div>

          <div className="max-h-[60vh] overflow-y-auto">
            {items.length === 0 ? (
              <div className="px-4 py-12 text-center">
                <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-foreground/[0.04] text-subtle">
                  <BellIcon size={22} />
                </span>
                <p className="mt-3 text-sm font-medium">No notifications yet</p>
                <p className="text-xs text-muted">We&apos;ll let you know when there&apos;s something new.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {items.map((n) => {
                  const Icon = ICONS[n.icon] ?? SparklesIcon;
                  return (
                    <li key={n.id} className="group relative">
                      <button
                        type="button"
                        onClick={() => openItem(n)}
                        className={
                          "flex w-full items-start gap-3 px-4 py-3 pr-9 text-left transition-colors hover:bg-foreground/5 " +
                          (n.read ? "" : "bg-primary/[0.04]")
                        }
                      >
                        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-2">
                            <span className="truncate text-sm font-medium">{n.title}</span>
                            {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">{n.body}</span>
                          <span className="mt-0.5 block text-[11px] text-subtle">{n.time}</span>
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => dismiss(n.id)}
                        aria-label="Dismiss notification"
                        className="absolute right-2 top-3 rounded-md p-1 text-subtle opacity-0 transition-opacity hover:text-foreground group-hover:opacity-100"
                      >
                        <XIcon size={14} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t border-border px-4 py-2 text-right">
              <button
                type="button"
                onClick={clearAll}
                className="text-xs font-medium text-muted transition-colors hover:text-danger"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
