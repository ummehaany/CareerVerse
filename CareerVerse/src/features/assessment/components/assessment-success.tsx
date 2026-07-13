"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircleIcon, ArrowRightIcon, SparklesIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";

export function AssessmentSuccess({ onGoDashboard }: { onGoDashboard: () => void }) {
  return (
    <div className="mx-auto max-w-xl py-6 text-center">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-success/10 text-success">
        <CheckCircleIcon size={34} />
      </div>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight">Assessment complete</h1>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">
        Nicely done. We&apos;ve saved your responses and built your career profile. You&apos;re ready
        to see the careers that fit you best.
      </p>

      <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={ROUTES.recommendations}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <SparklesIcon size={18} />
          See your career matches
          <ArrowRightIcon size={18} />
        </Link>
        <Button size="lg" variant="outline" onClick={onGoDashboard}>
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
