"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

/** Error boundary for Career Analytics. */
export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Career Analytics failed to load:", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-6xl py-16">
      <div className="mx-auto max-w-md rounded-xl border border-foreground/10 bg-background p-8 text-center shadow-sm">
        <h1 className="text-lg font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted">
          We couldn&apos;t load your analytics just now. This is usually temporary — please try again.
        </p>
        <Button type="button" onClick={reset} className="mt-5">
          Try again
        </Button>
      </div>
    </div>
  );
}
