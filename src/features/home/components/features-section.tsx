import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icon";
import { FEATURES } from "../config";
import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";

export function FeaturesSection() {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Reveal>
          <SectionHead
            eyebrow="What you can do"
            title="Everything your career journey needs"
            subtitle="Every card below links to a real, working part of CareerVerse — not a placeholder."
          />
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            const accent = `var(${feature.accentVar})`;
            return (
              <Reveal key={feature.key} delayMs={i * 60}>
                <Link
                  href={feature.href}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md sm:p-6"
                >
                  <span
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl"
                    style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
                  >
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-4 font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm text-muted">{feature.description}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium" style={{ color: accent }}>
                    {feature.cta}
                    <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
