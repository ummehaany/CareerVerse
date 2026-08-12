"use client";

import { CheckIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * A single selectable option card (goal / level). Reusable across steps; a
 * native <button> so it is fully keyboard accessible (Tab + Enter/Space).
 */
export function SelectableCard({
  emoji,
  label,
  description,
  selected,
  onSelect,
}: {
  emoji: string;
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "group relative flex w-full items-start gap-3 rounded-xl border p-4 text-left transition-all",
        "hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40",
        selected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border bg-background hover:border-foreground/20",
      )}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-foreground/5 text-xl">
        {emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block font-medium tracking-tight">{label}</span>
        {description && <span className="mt-0.5 block text-sm text-muted">{description}</span>}
      </span>
      <span
        className={cn(
          "mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors",
          selected ? "border-primary bg-primary text-primary-foreground" : "border-border text-transparent",
        )}
        aria-hidden="true"
      >
        <CheckIcon size={13} />
      </span>
    </button>
  );
}
