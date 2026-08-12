import type { DiscoveryPhase } from "../engine";
import { cn } from "@/lib/utils";

export function ProgressRail({ phases }: { phases: DiscoveryPhase[] }) {
  return (
    <ul className="space-y-2.5" aria-label="Discovery progress">
      {phases.map((p) => (
        <li key={p.key} className="flex items-center gap-2.5 text-sm">
          <span
            className={cn(
              "grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] font-bold",
              p.status === "done" && "bg-primary text-primary-foreground",
              p.status === "active" && "border-2 border-primary text-primary",
              p.status === "upcoming" && "border border-border text-subtle",
            )}
          >
            {p.status === "done" ? "✓" : p.status === "active" ? "" : ""}
          </span>
          <span
            className={cn(
              p.status === "done" && "text-muted line-through decoration-foreground/20",
              p.status === "active" && "font-semibold text-foreground",
              p.status === "upcoming" && "text-subtle",
            )}
          >
            {p.label}
          </span>
        </li>
      ))}
    </ul>
  );
}
