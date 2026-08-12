"use client";

import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarIcon,
  CheckCircleIcon,
  SparklesIcon,
  ClockIcon,
  TargetIcon,
  TrendingUpIcon,
  ArrowRightIcon,
} from "@/components/ui/icon";
import { GraduationCapIcon, AwardIcon } from "@/components/ui/icons-extended";
import type { CompanyRole } from "../types";

function Pills({ items, tone }: { items: string[]; tone: "req" | "pref" }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s) => (
        <span
          key={s}
          className={
            "inline-flex rounded-full border px-2.5 py-1 text-xs font-medium " +
            (tone === "req"
              ? "border-primary/25 bg-primary/10 text-primary"
              : "border-border bg-foreground/[0.03] text-foreground/75")
          }
        >
          {s}
        </span>
      ))}
    </div>
  );
}

export function RolesSection({
  roles,
  selectedKey,
  onSelect,
  onAnalyze,
}: {
  roles: CompanyRole[];
  selectedKey: string;
  onSelect: (key: string) => void;
  onAnalyze: (key: string) => void;
}) {
  const selected = roles.find((r) => r.key === selectedKey) ?? roles[0];

  return (
    <div className="grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]">
      {/* role list */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
          {roles.length} role types
        </p>
        <div className="flex flex-wrap gap-2 lg:flex-col">
          {roles.map((role) => {
            const active = role.key === selected.key;
            return (
              <button
                key={role.key}
                type="button"
                onClick={() => onSelect(role.key)}
                aria-pressed={active}
                className={
                  "rounded-lg border px-3 py-2 text-left text-sm transition-colors " +
                  (active
                    ? "border-primary/40 bg-primary/10 font-medium text-foreground"
                    : "border-border bg-background text-muted hover:border-foreground/20 hover:text-foreground")
                }
              >
                {role.title}
              </button>
            );
          })}
        </div>
      </div>

      {/* selected role detail */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">{selected.title}</h2>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <Badge variant="muted">{selected.family}</Badge>
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-success">
                <DollarIcon size={14} /> {selected.salaryLabel}
              </span>
              <span className="text-xs text-subtle">approx.</span>
            </div>
          </div>
          <Button type="button" size="sm" onClick={() => onAnalyze(selected.key)}>
            <SparklesIcon size={15} />
            Analyze my readiness
          </Button>
        </div>

        <p className="text-sm leading-relaxed text-muted">{selected.description}</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
              <TargetIcon size={13} /> Required skills
            </p>
            <Pills items={selected.requiredSkills} tone="req" />
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
              <SparklesIcon size={13} /> Preferred skills
            </p>
            <Pills items={selected.preferredSkills} tone="pref" />
          </div>
        </div>

        <div className="grid gap-3 border-t border-border pt-4 sm:grid-cols-3">
          <Facet icon={<GraduationCapIcon size={15} />} label="Education" value={selected.education} />
          <Facet icon={<ClockIcon size={15} />} label="Experience" value={selected.experience} />
          <Facet
            icon={<AwardIcon size={15} />}
            label="Certifications"
            value={selected.certifications.filter((c) => c && c !== "—").join(", ") || "None required"}
          />
        </div>

        <div className="rounded-lg border border-border bg-surface p-3">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
            <CheckCircleIcon size={13} /> Interview topics
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selected.interviewTopics.map((t) => (
              <span key={t} className="rounded-full bg-foreground/[0.04] px-2.5 py-1 text-xs text-foreground/75">
                {t}
              </span>
            ))}
          </div>
        </div>

        {selected.progression.length > 0 && (
          <div className="space-y-2">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
              <TrendingUpIcon size={13} /> Career progression
            </p>
            <div className="flex flex-wrap items-center gap-1.5">
              {selected.progression.map((step, i) => (
                <span key={step} className="inline-flex items-center gap-1.5">
                  <span className="rounded-lg border border-border bg-surface px-2.5 py-1 text-xs font-medium">{step}</span>
                  {i < selected.progression.length - 1 && <ArrowRightIcon size={12} className="text-subtle" />}
                </span>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function Facet({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="space-y-1">
      <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-subtle">
        <span className="text-primary">{icon}</span>
        {label}
      </p>
      <p className="text-sm text-muted">{value}</p>
    </div>
  );
}
