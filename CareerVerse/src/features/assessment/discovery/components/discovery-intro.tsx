"use client";

import { Button } from "@/components/ui/button";
import { ArrowRightIcon, ClockIcon, CompassIcon, ShieldIcon } from "@/components/ui/icon";

export function DiscoveryIntro({
  alreadyCompleted,
  onStart,
  onViewResults,
}: {
  alreadyCompleted: boolean;
  onStart: () => void;
  onViewResults: () => void;
}) {
  return (
    <div className="mx-auto max-w-2xl animate-fade-up">
      <section className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6 text-center sm:p-10">
        <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <CompassIcon size={14} /> Career Discovery
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">Career Discovery</h1>
        <p className="mx-auto mt-2 max-w-md text-base text-muted">
          Discover career paths that match your interests.
        </p>

        <div className="mx-auto mt-6 max-w-md space-y-2.5 text-left">
          <p className="text-sm text-foreground/80">
            <span className="font-medium text-foreground">No right or wrong answers.</span>
          </p>
          <p className="text-sm text-foreground/80">
            Answer honestly based on what you genuinely enjoy, not what others expect from you.
          </p>
          <p className="text-sm text-foreground/80">
            Your answers will help us understand your interests, working style and career preferences.
          </p>
        </div>

        <div className="mx-auto mt-6 flex w-fit items-center gap-2 rounded-lg border border-border bg-background px-3.5 py-2 text-sm font-medium text-muted">
          <ClockIcon size={16} /> 10 quick questions · About 1 minute
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={onStart}>
            {alreadyCompleted ? "Retake Discovery" : "Start Discovery"}
            <ArrowRightIcon size={18} />
          </Button>
          {alreadyCompleted && (
            <Button size="lg" variant="outline" onClick={onViewResults}>
              View my results
            </Button>
          )}
        </div>

        <p className="mt-5 inline-flex items-center gap-1.5 text-xs text-subtle">
          <ShieldIcon size={13} /> This is a guidance tool, not a diagnosis.
        </p>
      </section>
    </div>
  );
}
