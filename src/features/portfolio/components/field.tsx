"use client";

import type { ComponentType, ReactNode } from "react";
import type { IconProps } from "@/components/ui/icon";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

/** Generate a reasonably-unique id for a newly-added list item (client-side). */
export function newId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/** A titled section card with an accent icon tile — the editor's building block. */
export function SectionCard({
  icon: Icon,
  title,
  description,
  accentVar = "--primary",
  actions,
  children,
}: {
  icon: ComponentType<IconProps>;
  title: string;
  description?: string;
  accentVar?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Card className="space-y-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{
              background: `color-mix(in srgb, var(${accentVar}) 12%, transparent)`,
              color: `var(${accentVar})`,
            }}
          >
            <Icon size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            {description && <p className="mt-1 text-sm text-muted">{description}</p>}
          </div>
        </div>
        {actions}
      </div>
      {children}
    </Card>
  );
}

/** Labeled field wrapper for consistent spacing. */
export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-subtle">{hint}</p>}
    </div>
  );
}
