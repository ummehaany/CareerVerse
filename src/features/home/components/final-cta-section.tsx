import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, RocketIcon } from "@/components/ui/icon";
import type { HomeCta } from "../config";
import { Reveal } from "./reveal";

export function FinalCtaSection({ cta }: { cta: HomeCta }) {
  return (
    <section className="px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <Reveal className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-8 text-center sm:p-14">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <RocketIcon size={28} />
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl text-2xl font-semibold tracking-tight sm:text-4xl">
            Your next career move starts here.
          </h2>
          <p className="mx-auto mt-3 max-w-md text-sm text-muted sm:text-base">
            Discover where your strengths can take you.
          </p>
          <div className="mt-7">
            <Link href={cta.href}>
              <Button size="lg">
                {cta.label}
                <ArrowRightIcon size={16} />
              </Button>
            </Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
