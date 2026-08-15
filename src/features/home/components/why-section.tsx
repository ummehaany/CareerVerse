import { ArrowRightIcon } from "@/components/ui/icon";
import { VALUE_FLOW } from "../config";
import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";

export function WhySection() {
  return (
    <section className="border-t border-border bg-surface px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SectionHead eyebrow="Why CareerVerse" title="Stop guessing. Start building." />
        </Reveal>

        <Reveal delayMs={80}>
          <p className="mx-auto mt-5 max-w-2xl text-center text-sm text-muted sm:text-base">
            Career advice is usually scattered across quizzes, forums, and generic templates that
            don&apos;t know you. CareerVerse connects the parts that matter — discovery, matching,
            skill-building, and interview prep — into one profile that stays with you and gets more
            useful as you use it.
          </p>
        </Reveal>

        <Reveal delayMs={160}>
          <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-2 gap-y-4">
            {VALUE_FLOW.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={step.key} className="flex items-center gap-2">
                  <div className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-background px-5 py-4 text-center shadow-sm">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                      <Icon size={20} />
                    </span>
                    <span className="text-sm font-semibold tracking-tight">{step.label}</span>
                  </div>
                  {i < VALUE_FLOW.length - 1 && (
                    <ArrowRightIcon size={18} className="hidden shrink-0 text-subtle sm:block" aria-hidden="true" />
                  )}
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
