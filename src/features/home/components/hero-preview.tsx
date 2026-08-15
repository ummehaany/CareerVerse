import { CompassIcon, ShieldIcon } from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { SAMPLE_MATCHES } from "../config";
import { MatchPreviewCard } from "./match-preview-card";

/**
 * The hero's product-preview panel: a compact, illustrative rendering of the
 * real Career Discovery results screen (alignment %, progress bars, driver
 * chips — see match-preview-card.tsx). Explicitly labeled as a preview so it
 * never reads as a real user's results.
 */
export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-md">
      {/* Ambient accent glow behind the card — presentational only. */}
      <div
        aria-hidden="true"
        className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/20 via-transparent to-transparent blur-2xl"
      />
      <div className="overflow-hidden rounded-2xl border border-border bg-background/95 shadow-xl shadow-primary/5 backdrop-blur">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight">
            <CompassIcon size={16} className="text-primary" />
            Career Discovery
          </span>
          <Badge variant="muted">Product preview</Badge>
        </div>

        <div className="space-y-2.5 p-4">
          {SAMPLE_MATCHES.slice(0, 3).map((match, i) => (
            <MatchPreviewCard key={match.id} match={match} rank={i} compact />
          ))}
        </div>

        <p className="flex items-start gap-1.5 border-t border-border px-4 py-3 text-[11px] text-subtle">
          <ShieldIcon size={12} className="mt-0.5 shrink-0" />
          Illustrative example — your results will be based on your own answers.
        </p>
      </div>
    </div>
  );
}
