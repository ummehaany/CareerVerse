"use client";

import { useState } from "react";
import { SECTION_LABELS } from "../defaults";
import { ChevronRightIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function GripGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0 text-subtle">
      <circle cx="9" cy="6" r="1.6" />
      <circle cx="15" cy="6" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

/**
 * Drag-and-drop (with accessible up/down fallback) ordering of resume sections.
 * Order is applied to the live preview.
 */
export function SectionArranger({
  order,
  onReorder,
}: {
  order: string[];
  onReorder: (next: string[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const keys = order.filter((k) => SECTION_LABELS[k]);

  function move(from: number, to: number) {
    if (to < 0 || to >= keys.length || from === to) return;
    const next = [...keys];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onReorder(next);
  }

  return (
    <ul className="space-y-1.5">
      {keys.map((key, index) => (
        <li
          key={key}
          draggable
          onDragStart={() => setDragIndex(index)}
          onDragEnd={() => {
            setDragIndex(null);
            setOverIndex(null);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setOverIndex(index);
          }}
          onDrop={(e) => {
            e.preventDefault();
            if (dragIndex !== null) move(dragIndex, index);
            setDragIndex(null);
            setOverIndex(null);
          }}
          className={cn(
            "flex cursor-grab items-center gap-2 rounded-lg border bg-background px-3 py-2 text-sm transition-colors active:cursor-grabbing",
            overIndex === index && dragIndex !== null ? "border-primary/50 bg-primary/5" : "border-border",
          )}
        >
          <GripGlyph />
          <span className="flex-1 font-medium">{SECTION_LABELS[key]}</span>
          <span className="text-xs text-subtle tabular-nums">{index + 1}</span>
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => move(index, index - 1)}
              disabled={index === 0}
              aria-label={`Move ${SECTION_LABELS[key]} up`}
              className="rounded p-1 text-subtle transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-30"
            >
              <ChevronRightIcon size={15} className="-rotate-90" />
            </button>
            <button
              type="button"
              onClick={() => move(index, index + 1)}
              disabled={index === keys.length - 1}
              aria-label={`Move ${SECTION_LABELS[key]} down`}
              className="rounded p-1 text-subtle transition-colors hover:bg-foreground/5 hover:text-foreground disabled:opacity-30"
            >
              <ChevronRightIcon size={15} className="rotate-90" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
