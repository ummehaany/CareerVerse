import { HOW_IT_WORKS } from "../config";
import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-border bg-surface px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHead
            eyebrow="How it works"
            title="From uncertainty to a clear plan"
            subtitle="Four steps take you from “I don’t know where to start” to a personal, evolving plan."
          />
        </Reveal>

        <div className="relative mt-12">
          {/* Connecting line — desktop only, purely presentational. */}
          <div aria-hidden="true" className="absolute left-0 right-0 top-6 hidden h-px bg-border lg:block" />
          <ol className="relative grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {HOW_IT_WORKS.map((step, i) => {
              const Icon = step.icon;
              const accent = `var(${step.accentVar})`;
              return (
                <Reveal key={step.key} as="li" delayMs={i * 90} className="relative">
                  <div
                    className="relative z-10 mb-4 grid h-12 w-12 place-items-center rounded-full border-4 border-surface"
                    style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 14%, transparent)` }}
                  >
                    <Icon size={22} />
                  </div>
                  <p className="text-xs font-semibold tracking-wide text-subtle">{step.index}</p>
                  <h3 className="mt-1 font-semibold tracking-tight">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{step.description}</p>
                </Reveal>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
