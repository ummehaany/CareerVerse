"use client";

import type { ComponentType, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import type { IconProps } from "@/components/ui/icon";
import {
  CompassIcon,
  TargetIcon,
  HeartIcon,
  LayersIcon,
  CodeIcon,
  BriefcaseIcon,
  RouteIcon,
  CheckCircleIcon,
  ClockIcon,
  SparklesIcon,
  DollarIcon,
  UsersIcon,
  TrendingUpIcon,
} from "@/components/ui/icon";
import { GraduationCapIcon, MapPinIcon } from "@/components/ui/icons-extended";
import type { CompanyProfile } from "../types";

function Section({
  icon: Icon,
  title,
  children,
  className = "",
}: {
  icon: ComponentType<IconProps>;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={"space-y-3 " + className}>
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon size={16} />
        </span>
        <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      {children}
    </Card>
  );
}

function Pills({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-xs font-medium text-foreground/80"
        >
          {item}
        </span>
      ))}
    </div>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="space-y-1.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2 text-sm text-muted">
          <CheckCircleIcon size={15} className="mt-0.5 shrink-0 text-success" />
          {item}
        </li>
      ))}
    </ul>
  );
}

export function OverviewSection({ profile }: { profile: CompanyProfile }) {
  const p = profile;
  const r = p.record;

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={CompassIcon} title="Overview">
          <p className="text-sm leading-relaxed text-muted">{r.about}</p>
        </Section>
        <Section icon={TargetIcon} title="Mission">
          <p className="text-sm leading-relaxed text-muted">{r.mission}</p>
        </Section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={HeartIcon} title="Culture & values">
          <Pills items={r.cultureValues} />
        </Section>
        <Section icon={LayersIcon} title="Products & services">
          <Pills items={r.products} />
        </Section>
      </div>

      <Section icon={CodeIcon} title="Engineering culture">
        <p className="text-sm leading-relaxed text-muted">{r.engineeringCulture}</p>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={MapPinIcon} title="Office locations">
          <Pills items={r.offices} />
        </Section>
        <Section icon={BriefcaseIcon} title="Career opportunities">
          <p className="text-sm leading-relaxed text-muted">{p.careerOpportunities}</p>
        </Section>
      </div>

      {/* Hiring process */}
      <Section icon={RouteIcon} title="Hiring process & recruitment stages">
        <ol className="space-y-3">
          {p.hiringProcess.map((stage, i) => (
            <li key={stage.stage} className="flex gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 border-primary bg-background text-xs font-bold text-primary tabular-nums">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-medium">{stage.stage}</p>
                <p className="text-sm text-muted">{stage.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={CheckCircleIcon} title="Eligibility criteria">
          <Bullets items={p.eligibility} />
        </Section>
        <Section icon={ClockIcon} title="Hiring timeline">
          <div className="space-y-2.5">
            {p.hiringTimeline.map((t) => (
              <div key={t.phase} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-surface px-3 py-2">
                <span className="text-sm font-medium">{t.phase}</span>
                <span className="text-xs text-subtle tabular-nums">{t.duration}</span>
              </div>
            ))}
          </div>
        </Section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={GraduationCapIcon} title="Internship opportunities">
          <div className="space-y-2">
            <p className="text-sm font-medium">{p.internship.title}</p>
            <p className="text-sm text-muted">{p.internship.description}</p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs">
              <span className="rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">{p.internship.duration}</span>
              <span className="rounded-full bg-success/10 px-2.5 py-1 font-medium text-success">{p.internship.stipend}</span>
            </div>
          </div>
        </Section>
        <Section icon={GraduationCapIcon} title="Graduate hiring program">
          <div className="space-y-2">
            <p className="text-sm font-medium">{p.graduateProgram.title}</p>
            <p className="text-sm text-muted">{p.graduateProgram.description}</p>
          </div>
        </Section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={SparklesIcon} title="Benefits & perks">
          <Pills items={p.benefits} />
        </Section>
        <Section icon={DollarIcon} title="Salary ranges">
          <p className="text-2xl font-bold tracking-tight">{p.salaryRange.label}</p>
          <p className="text-xs text-subtle">
            Across {p.roles.length} role types (₹ LPA, approximate). See the Roles tab for per-role bands.
          </p>
        </Section>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Section icon={UsersIcon} title="Work environment">
          <p className="text-sm leading-relaxed text-muted">{p.workEnvironment}</p>
        </Section>
        <Section icon={TrendingUpIcon} title="Growth opportunities">
          <Bullets items={p.growthOpportunities} />
        </Section>
      </div>
    </div>
  );
}
