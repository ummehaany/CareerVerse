"use client";

import { Button } from "@/components/ui/button";
import { SparklesIcon, ClockIcon } from "@/components/ui/icon";

export function WelcomeScreen({ firstName, onBegin }: { firstName: string; onBegin: () => void }) {
  return (
    <div className="mx-auto max-w-xl animate-fade-up px-4 py-10 text-center sm:py-16">
      <div
        className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, var(--accent-assessment), var(--accent-mentor))" }}
      >
        <SparklesIcon size={30} />
      </div>
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        👋 Hi, {firstName}!
      </h1>
      <p className="mt-3 text-lg font-medium text-foreground/80">Welcome to CareerVerse.</p>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
        Let&apos;s discover the career path that&apos;s truly right for you. This isn&apos;t a test — there are no right
        or wrong answers. We&apos;ll simply get to know you so we can personalize every recommendation.
      </p>
      <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted">
        <ClockIcon size={15} /> Estimated time: 5–8 minutes
      </div>
      <div className="mt-8">
        <Button size="lg" onClick={onBegin} className="px-8">
          ✨ Let&apos;s Begin
        </Button>
      </div>
    </div>
  );
}
