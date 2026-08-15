import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRightIcon, ShieldIcon, SparklesIcon } from "@/components/ui/icon";
import type { HomeCta } from "../config";
import { SAMPLE_MATCHES, SAMPLE_TRAITS } from "../config";
import { MatchPreviewCard } from "./match-preview-card";
import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";

export function DiscoveryShowcaseSection({ cta }: { cta: HomeCta }) {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHead
            eyebrow="Career Discovery"
            title="See what your results look like"
            subtitle="A preview of the real Career Discovery results screen — built from your own answers, ranked by fit."
          />
        </Reveal>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-12">
          <Reveal className="order-2 lg:order-1">
            <div className="space-y-4">
              <p className="text-sm text-muted sm:text-base">
                Every answer you give during Career Discovery feeds one profile — the same profile
                that ranks your Top 5 careers, explains <em className="text-foreground not-italic font-medium">why</em>{" "}
                each one fits, and points you toward the skills to build next.
              </p>
              <ul className="space-y-2.5 text-sm text-muted">
                <li className="flex items-start gap-2">
                  <SparklesIcon size={16} className="mt-0.5 shrink-0 text-primary" />
                  Fit scores ranked against your actual answers, not a generic quiz result.
                </li>
                <li className="flex items-start gap-2">
                  <SparklesIcon size={16} className="mt-0.5 shrink-0 text-primary" />A plain-language
                  explanation of why each career matches you.
                </li>
                <li className="flex items-start gap-2">
                  <SparklesIcon size={16} className="mt-0.5 shrink-0 text-primary" />
                  Salary ranges, growth outlook, and next steps for every match.
                </li>
              </ul>
              <Link href={cta.href} className="inline-block pt-2">
                <Button>
                  {cta.label}
                  <ArrowRightIcon size={16} />
                </Button>
              </Link>
            </div>
          </Reveal>

          <Reveal delayMs={120} className="order-1 lg:order-2">
            <div className="overflow-hidden rounded-2xl border border-border bg-background shadow-xl shadow-primary/5">
              <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                <p className="text-sm font-semibold tracking-tight">Your Career Matches</p>
                <Badge variant="muted">Product preview</Badge>
              </div>

              <div className="space-y-3 p-5">
                {SAMPLE_MATCHES.map((match, i) => (
                  <MatchPreviewCard key={match.id} match={match} rank={i} />
                ))}
              </div>

              <div className="space-y-3 border-t border-border p-5">
                <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
                  Illustrative strengths profile
                </p>
                <div className="space-y-2.5">
                  {SAMPLE_TRAITS.map((trait) => (
                    <div key={trait.key} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-foreground/80">{trait.label}</span>
                        <span className="tabular-nums text-subtle">{trait.value}%</span>
                      </div>
                      <Progress
                        value={trait.value}
                        color={`var(${trait.accentVar})`}
                        label={`${trait.label} ${trait.value}%`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <p className="flex items-start gap-1.5 border-t border-border px-5 py-3 text-[11px] text-subtle">
                <ShieldIcon size={12} className="mt-0.5 shrink-0" />
                Sample data for illustration — your matches and strengths profile will be your own.
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
