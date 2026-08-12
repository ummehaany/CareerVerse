"use client";

import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, XIcon } from "@/components/ui/icon";

/**
 * Reusable add/remove tag input for a list of plain strings
 * (e.g. a project's technologies). Fully controlled.
 */
export function ChipInput({
  value,
  onChange,
  placeholder = "Add and press Enter",
  ariaLabel = "Add item",
}: {
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  ariaLabel?: string;
}) {
  const [draft, setDraft] = useState("");

  function add(e: FormEvent) {
    e.preventDefault();
    const clean = draft.trim();
    if (!clean) return;
    if (!value.some((v) => v.toLowerCase() === clean.toLowerCase())) {
      onChange([...value, clean]);
    }
    setDraft("");
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <form onSubmit={add} className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          aria-label={ariaLabel}
        />
        <Button type="submit" size="md" variant="outline" disabled={!draft.trim()}>
          <PlusIcon size={16} />
          Add
        </Button>
      </form>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-xs font-medium text-foreground/80"
            >
              {item}
              <button
                type="button"
                onClick={() => remove(i)}
                aria-label={`Remove ${item}`}
                className="text-subtle transition-colors hover:text-danger"
              >
                <XIcon size={13} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
