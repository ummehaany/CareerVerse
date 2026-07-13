"use client";

import type { AnswerValue, Option } from "../types";
import { OptionIcon, hasIcon } from "./option-icon";
import { CheckIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function OptionCardGroup({
  options,
  value,
  multiple,
  max,
  onChange,
  invalid,
  groupLabel,
}: {
  options: Option[];
  value: AnswerValue | undefined;
  multiple: boolean;
  max?: number;
  onChange: (value: AnswerValue) => void;
  invalid?: boolean;
  groupLabel: string;
}) {
  const selected = multiple
    ? Array.isArray(value)
      ? value
      : []
    : typeof value === "string" && value
      ? [value]
      : [];
  const atMax = multiple && max ? selected.length >= max : false;
  const anyIcon = options.some((o) => hasIcon(o.icon));

  function toggle(optionValue: string) {
    if (!multiple) {
      onChange(optionValue);
      return;
    }
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else if (!atMax) {
      onChange([...selected, optionValue]);
    }
  }

  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      aria-label={groupLabel}
      aria-invalid={invalid || undefined}
      className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
    >
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const disabled = !isSelected && atMax;
        return (
          <button
            key={option.value}
            type="button"
            role={multiple ? undefined : "radio"}
            aria-checked={multiple ? undefined : isSelected}
            aria-pressed={multiple ? isSelected : undefined}
            disabled={disabled}
            onClick={() => toggle(option.value)}
            className={cn(
              "group relative flex items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-150",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
              isSelected
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border bg-background hover:border-foreground/25 hover:bg-foreground/[0.02]",
              disabled && "cursor-not-allowed opacity-45 hover:border-border hover:bg-background",
            )}
          >
            {anyIcon && (
              <span
                className={cn(
                  "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition-colors",
                  isSelected ? "bg-primary/15 text-primary" : "bg-foreground/5 text-muted",
                )}
              >
                <OptionIcon name={option.icon} size={18} />
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{option.label}</span>
              {option.description && (
                <span className="mt-0.5 block text-xs text-muted">{option.description}</span>
              )}
            </span>
            <span
              className={cn(
                "grid h-5 w-5 shrink-0 place-items-center border transition-all",
                multiple ? "rounded-md" : "rounded-full",
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-foreground/25 text-transparent",
              )}
            >
              <CheckIcon size={13} />
            </span>
          </button>
        );
      })}
    </div>
  );
}
