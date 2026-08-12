"use client";

import { useState } from "react";
import type { Faq } from "../config";
import { ChevronRightIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

/**
 * Single-open FAQ accordion. Mirrors the disclosure pattern used by the
 * recommendation and roadmap cards (aria-expanded + chevron rotation).
 */
export function FaqAccordion({ items }: { items: Faq[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const detailsId = `faq-${index}`;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              aria-expanded={isOpen}
              aria-controls={detailsId}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-foreground/[0.02]"
            >
              <span className="text-sm font-medium sm:text-base">{item.q}</span>
              <ChevronRightIcon
                size={16}
                className={cn(
                  "shrink-0 text-subtle transition-transform",
                  isOpen && "rotate-90 text-primary",
                )}
              />
            </button>
            {isOpen && (
              <p id={detailsId} className="px-5 pb-4 text-sm text-muted">
                {item.a}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
