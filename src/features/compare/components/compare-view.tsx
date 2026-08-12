"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { ComparePageData } from "../queries";
import type { Career } from "@/lib/careers/types";
import { formatCareerSalary, demandVariant } from "@/features/careers/format";
import { computeSkillGap } from "@/features/careers/analysis";
import { SectionHeading } from "@/components/shared/state-panels";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function Rating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={cn("h-1.5 w-3.5 rounded-full", n <= value ? "bg-primary" : "bg-foreground/15")}
        />
      ))}
    </div>
  );
}

function Row({ label, a, b }: { label: string; a: ReactNode; b: ReactNode }) {
  return (
    <tr className="border-t border-border align-top">
      <th scope="row" className="py-3 pr-3 text-left text-xs font-medium uppercase tracking-wide text-subtle">
        {label}
      </th>
      <td className="px-3 py-3 text-sm">{a}</td>
      <td className="px-3 py-3 text-sm">{b}</td>
    </tr>
  );
}

function Skills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1">
      {items.map((s) => (
        <span key={s} className="rounded-full border border-border bg-foreground/[0.03] px-2 py-0.5 text-xs">
          {s}
        </span>
      ))}
    </div>
  );
}

function learningMonths(career: Career): number {
  return Math.min(24, 3 + career.difficulty * 3);
}

function MatchScore({ career, userSkills }: { career: Career; userSkills: string[] }) {
  if (userSkills.length === 0) return <span className="text-subtle">Take assessment</span>;
  const pct = computeSkillGap(userSkills, career).matchPercent;
  const color = pct >= 66 ? "text-success" : pct >= 40 ? "text-primary" : "text-warning";
  return <span className={cn("font-semibold tabular-nums", color)}>{pct}%</span>;
}

export function CompareView({ data }: { data: ComparePageData }) {
  const sorted = useMemo(
    () => [...data.careers].sort((x, y) => x.title.localeCompare(y.title)),
    [data.careers],
  );
  const bySlug = useMemo(() => new Map(data.careers.map((c) => [c.slug, c])), [data.careers]);

  const [slugA, setSlugA] = useState(sorted[0]?.slug ?? "");
  const [slugB, setSlugB] = useState(sorted[1]?.slug ?? sorted[0]?.slug ?? "");

  const a = bySlug.get(slugA);
  const b = bySlug.get(slugB);

  return (
    <div className="mx-auto max-w-4xl space-y-6 animate-fade-up">
      <SectionHeading
        title="Compare Careers"
        description="Put two careers side by side across pay, demand, skills, and your own fit."
      />

      <div className="grid grid-cols-2 gap-3">
        <Select value={slugA} onChange={(e) => setSlugA(e.target.value)} aria-label="First career">
          {sorted.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </Select>
        <Select value={slugB} onChange={(e) => setSlugB(e.target.value)} aria-label="Second career">
          {sorted.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.title}
            </option>
          ))}
        </Select>
      </div>

      {a && b && (
        <div className="overflow-x-auto rounded-2xl border border-border bg-background">
          <table className="w-full min-w-[560px] border-collapse">
            <thead>
              <tr>
                <th className="w-32 px-3 py-3" />
                <th className="px-3 py-3 text-left text-sm font-semibold">{a.title}</th>
                <th className="px-3 py-3 text-left text-sm font-semibold">{b.title}</th>
              </tr>
            </thead>
            <tbody>
              <Row label="Category" a={a.category} b={b.category} />
              <Row
                label="Salary in India (illustrative)"
                a={formatCareerSalary(a, "INR")}
                b={formatCareerSalary(b, "INR")}
              />
              <Row
                label="Demand"
                a={<Badge variant={demandVariant(a.demand)}>{a.demand}</Badge>}
                b={<Badge variant={demandVariant(b.demand)}>{b.demand}</Badge>}
              />
              <Row label="Growth outlook" a={a.growth} b={b.growth} />
              <Row label="Work-life balance" a={<Rating value={a.workLifeBalance} />} b={<Rating value={b.workLifeBalance} />} />
              <Row label="Difficulty" a={<Rating value={a.difficulty} />} b={<Rating value={b.difficulty} />} />
              <Row label="Learning time" a={`~${learningMonths(a)} months`} b={`~${learningMonths(b)} months`} />
              <Row
                label="Your match score"
                a={<MatchScore career={a} userSkills={data.userSkills} />}
                b={<MatchScore career={b} userSkills={data.userSkills} />}
              />
              <Row label="Education" a={a.education} b={b.education} />
              <Row label="Required skills" a={<Skills items={a.skills} />} b={<Skills items={b.skills} />} />
              <Row label="Certifications" a={a.certifications.join(", ")} b={b.certifications.join(", ")} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
