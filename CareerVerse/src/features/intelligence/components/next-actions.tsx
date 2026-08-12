import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icon";
import type { NextBestAction } from "../types";
import { INTEL_ICONS } from "./icons";

/** Ranked "recommended for you" list — the next best steps across all modules. */
export function NextActions({ actions }: { actions: NextBestAction[] }) {
  if (actions.length === 0) return null;
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {actions.map((a) => {
        const Icon = INTEL_ICONS[a.icon] ?? INTEL_ICONS.sparkles;
        const accent = `var(${a.accentVar})`;
        return (
          <li key={a.id}>
            <Link
              href={a.href}
              className="group flex h-full items-start gap-3 rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md"
            >
              <span
                className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
                style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 13%, transparent)` }}
                aria-hidden="true"
              >
                <Icon size={18} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium">{a.title}</span>
                <span className="mt-0.5 block text-xs text-muted">{a.detail}</span>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                  {a.cta}
                  <ArrowRightIcon size={13} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
