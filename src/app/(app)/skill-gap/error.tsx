"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/**
 * Route-level error boundary for the Skill Gap Analysis page.
 * Keeps failures contained to this section instead of breaking the app shell.
 */
export default function SkillGapError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Skill Gap Analysis failed to load:", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md rounded-xl border border-foreground/10 bg-background p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted">
          We couldn&apos;t load your Skill Gap Analysis just now. This is usually
          temporary — please try again.
        </p>
        <Button type="button" onClick={reset} className="mt-5">
          Try again
        </Button>
      </div>
    </div>
  );
}
