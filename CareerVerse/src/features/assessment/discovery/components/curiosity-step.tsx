"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRightIcon, SparklesIcon } from "@/components/ui/icon";

/**
 * One lightweight, fully optional free-text moment after the 10 scored
 * questions. Never fed into scoring (per product brief — keep it a safe,
 * explainable personalization signal, not scoring complexity); shown back to
 * the student on the results page and saved as their profile "aspiration."
 */
export function CuriosityStep({
  initialValue,
  onSubmit,
}: {
  initialValue: string;
  onSubmit: (note: string) => void;
}) {
  const [value, setValue] = useState(initialValue);

  return (
    <div className="mx-auto max-w-lg animate-fade-up space-y-6 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-primary/10 text-primary">
        <SparklesIcon size={22} />
      </div>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">One more thing — totally optional</h2>
        <p className="mt-1.5 text-sm text-muted">Is there a career you&apos;ve already been curious about?</p>
      </div>

      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="e.g. Physiotherapist, UX Researcher, Diplomat…"
        maxLength={120}
        className="text-center"
        autoFocus
      />

      <div className="flex flex-col items-center gap-2.5 sm:flex-row sm:justify-center">
        <Button onClick={() => onSubmit(value.trim())}>
          Continue
          <ArrowRightIcon size={16} />
        </Button>
        <Button variant="ghost" onClick={() => onSubmit("")}>
          Skip
        </Button>
      </div>
    </div>
  );
}
