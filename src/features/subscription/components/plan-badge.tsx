import { cn } from "@/lib/utils";

/** Plan pill: "⭐ CareerVerse Pro" or "🟢 Free Plan". Presentational + theme-aware. */
export function PlanBadge({ isPro, className }: { isPro: boolean; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isPro
          ? "bg-primary/10 text-primary ring-1 ring-inset ring-primary/25"
          : "bg-foreground/[0.05] text-muted ring-1 ring-inset ring-border",
        className,
      )}
    >
      {isPro ? "⭐ CareerVerse Pro" : "🟢 Free Plan"}
    </span>
  );
}
