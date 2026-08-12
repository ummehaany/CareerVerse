"use client";

import { useEffect, useState } from "react";
import { SparklesIcon } from "@/components/ui/icon";

const MESSAGES = [
  "Understanding your interests…",
  "Analyzing your working style…",
  "Matching career paths…",
  "Preparing your recommendations…",
  "Almost there…",
];

/**
 * A short, honest pacing animation — not a fake API call. Scoring is plain
 * arithmetic and finishes instantly; this just gives the moment room to feel
 * considered rather than instant, per the product brief (3–5 seconds).
 */
export function DiscoveryAnalysis({ onDone, durationMs = 3800 }: { onDone: () => void; durationMs?: number }) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    const stepMs = Math.round(durationMs / MESSAGES.length);
    const interval = setInterval(() => {
      setStep((s) => Math.min(s + 1, MESSAGES.length - 1));
    }, stepMs);
    const done = setTimeout(onDone, durationMs);
    return () => {
      clearInterval(interval);
      clearTimeout(done);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mx-auto flex min-h-[55vh] max-w-md flex-col items-center justify-center px-4 text-center animate-fade-up">
      <div className="relative mb-7 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <SparklesIcon size={28} />
      </div>
      <p key={step} className="cv-q-enter text-base font-medium text-foreground">
        {MESSAGES[step]}
      </p>
    </div>
  );
}
