import Link from "next/link";
import { SparklesIcon, ArrowRightIcon, CompassIcon } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { HomeCtaSet } from "../config";
import { HeroPreview } from "./hero-preview";
import { Reveal } from "./reveal";

export function HeroSection({ ctas, firstName }: { ctas: HomeCtaSet; firstName: string | null }) {
  return (
    <section className="relative overflow-hidden px-4 pb-16 pt-14 sm:px-6 sm:pb-24 sm:pt-20 lg:px-8">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <SparklesIcon size={14} />
            AI-powered career development
          </span>

          <h1 className="mt-5 text-4xl font-bold tracking-tight sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            {firstName ? `Welcome back, ${firstName}.` : "Your Career."}
            {!firstName && (
              <>
                <br />
                Your Skills.
                <br />
                Your Next Move.
              </>
            )}
          </h1>

          <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
            CareerVerse turns guesswork into a plan. Discover careers that fit who you are, understand
            your strengths and skill gaps, practice the interviews that get you there, and track it
            all in one connected career journey.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href={ctas.heroPrimary.href}>
              <Button size="lg" className="w-full sm:w-auto">
                <CompassIcon size={18} />
                {ctas.heroPrimary.label}
                <ArrowRightIcon size={16} />
              </Button>
            </Link>
            <Link href={ctas.heroSecondary.href}>
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {ctas.heroSecondary.label}
              </Button>
            </Link>
          </div>
        </Reveal>

        <Reveal delayMs={120}>
          <HeroPreview />
        </Reveal>
      </div>
    </section>
  );
}
