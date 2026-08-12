"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function AchievementsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-xl py-6">
      <Card className="flex flex-col items-center gap-4 py-12 text-center">
        <div className="space-y-1">
          <p className="text-lg font-semibold">Something went wrong</p>
          <p className="mx-auto max-w-sm text-sm text-muted">
            We couldn&apos;t load your achievements. Please try again.
          </p>
        </div>
        <Button onClick={reset}>Try again</Button>
      </Card>
    </div>
  );
}
