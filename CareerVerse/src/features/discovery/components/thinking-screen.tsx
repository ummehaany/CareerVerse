"use client";

import { useEffect, useState } from "react";
import { SparklesIcon } from "@/components/ui/icon";

const LINES = [
  "Analyzing your strengths…",
  "Understanding your learning style…",
  "Reading your problem-solving signals…",
  "Matching careers that fit you…",
  "Creating your recommendations…",
];

export function ThinkingScreen() {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep((s) => Math.min(s + 1, LINES.length)), 900);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <div
        className="relative mb-8 grid h-20 w-20 place-items-center rounded-full text-white"
        style={{ background: "linear-gradient(135deg, var(--accent-assessment), var(--accent-mentor))" }}
      >
        <span className="absolute inset-0 animate-ping rounded-full opacity-30" style={{ background: "var(--primary)" }} />
        <SparklesIcon size={34} />
      </div>
      <h2 className="text-xl font-bold tracking-tight">Our AI mentor is building your Career Profile…</h2>
      <ul className="mt-6 w-full space-y-2 text-left">
        {LINES.map((line, i) => (
          <li
            key={line}
            className={cnStatus(i, step)}
            style={{ transition: "opacity .4s ease, transform .4s ease" }}
          >
            <span className="inline-block w-5">{i < step ? "✓" : i === step ? "⏳" : "•"}</span>
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

function cnStatus(i: number, step: number): string {
  const base = "flex items-center gap-2 text-sm ";
  if (i < step) return base + "text-foreground/80";
  if (i === step) return base + "font-medium text-foreground";
  return base + "text-subtle opacity-60";
}
