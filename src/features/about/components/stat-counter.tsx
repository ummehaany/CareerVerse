"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * A single platform-highlight stat that animates from 0 to its value the first
 * time it scrolls into view. Respects prefers-reduced-motion. Client-only.
 *
 * The icon is passed as an already-rendered element (ReactNode), not a component
 * function, so nothing non-serializable crosses the Server → Client boundary.
 */
export function StatCounter({
  value,
  suffix = "",
  label,
  icon,
  accentVar,
}: {
  value: number;
  suffix?: string;
  label: string;
  icon: ReactNode;
  accentVar: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  const accent = `var(${accentVar})`;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    if (reduce) {
      setDisplay(value);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started.current) {
            started.current = true;
            const duration = 1600;
            const start = performance.now();
            const tick = (now: number) => {
              const progress = Math.min(1, (now - start) / duration);
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplay(Math.round(value * eased));
              if (progress < 1) requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);
          }
        }
      },
      { threshold: 0.35 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div
      ref={ref}
      className="rounded-2xl border border-border bg-background p-5 text-center transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-6"
    >
      <span
        className="mx-auto grid h-11 w-11 place-items-center rounded-xl"
        style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
      >
        {icon}
      </span>
      <p className="mt-3 text-3xl font-bold tracking-tight tabular-nums">
        {display.toLocaleString("en-IN")}
        {suffix}
      </p>
      <p className="mt-1 text-sm text-muted">{label}</p>
    </div>
  );
}
