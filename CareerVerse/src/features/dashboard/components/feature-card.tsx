import Link from "next/link";
import type { FeatureSection } from "../config";
import { Badge } from "@/components/ui/badge";
import { ArrowRightIcon } from "@/components/ui/icon";

export function FeatureCard({ feature, status }: { feature: FeatureSection; status: string }) {
  const Icon = feature.icon;
  const accent = `var(${feature.accentVar})`;

  return (
    <Link
      href={feature.href}
      className="group flex flex-col rounded-xl border border-border bg-background p-5 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <span
          className="grid h-11 w-11 place-items-center rounded-xl"
          style={{
            color: accent,
            backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)`,
          }}
        >
          <Icon size={22} />
        </span>
        <Badge variant="muted">{status}</Badge>
      </div>
      <h3 className="mt-4 font-semibold tracking-tight">{feature.title}</h3>
      <p className="mt-1 flex-1 text-sm text-muted">{feature.description}</p>
      <span
        className="mt-4 inline-flex items-center gap-1 text-sm font-medium"
        style={{ color: accent }}
      >
        {feature.cta}
        <ArrowRightIcon size={15} className="transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
