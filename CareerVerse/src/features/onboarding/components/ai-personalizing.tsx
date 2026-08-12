"use client";

import { useEffect, useState } from "react";
import { SparklesIcon } from "@/components/ui/icon";

/**
 * Step 6 — a smooth, honest "personalizing" screen. No fake API calls: the
 * parent kicks off the real save in parallel; this component just runs a timed
 * animation (rotating messages + progress) and calls `onDone` when it finishes.
 */
export function AIPersonalizing({
  messages,
  onDone,
  durationMs = 4000,
}: {
  messages: string[];
  onDone: () => void;
  durationMs?: number;
}) {
  const [index, setIndex] = useState(0);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setPct(100));
    const rotate = window.setInterval(
      () => setIndex((i) => Math.min(i + 1, messages.length - 1)),
      2000,
    );
    const finish = window.setTimeout(onDone, durationMs);
    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(rotate);
      window.clearTimeout(finish);
    };
  }, [messages.length, onDone, durationMs]);

  return (
    <div className="flex flex-col items-center text-center animate-fade-in">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
        <SparklesIcon size={30} className="animate-pulse" />
      </span>
      <h2 className="mt-5 text-xl font-semibold tracking-tight sm:text-2xl">
        Personalizing CareerVerse
      </h2>
      <p
        key={index}
        className="mt-2 h-6 text-sm text-muted animate-fade-up"
        aria-live="polite"
      >
        {messages[index]}
      </p>

      <div className="mt-6 h-2 w-full max-w-xs overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-primary transition-[width] ease-out"
          style={{ width: `${pct}%`, transitionDuration: `${durationMs}ms` }}
        />
      </div>
    </div>
  );
}
