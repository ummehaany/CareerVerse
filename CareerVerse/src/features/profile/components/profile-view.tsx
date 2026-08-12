"use client";

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { IconProps } from "@/components/ui/icon";
import {
  TargetIcon,
  FileTextIcon,
  RouteIcon,
  MicIcon,
  PuzzleIcon,
  SparklesIcon,
  ChartIcon,
  ClockIcon,
  RocketIcon,
  ArrowRightIcon,
} from "@/components/ui/icon";
import { AwardIcon, EditIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { ProfilePageData } from "../types";
import { PublicProfileCard } from "./public-profile-card";
import { ExportProfileButton } from "./export-profile-button";

function AccentTile({ icon: Icon, accentVar, size = 18 }: { icon: ComponentType<IconProps>; accentVar: string; size?: number }) {
  const accent = `var(${accentVar})`;
  return (
    <span
      className="grid h-9 w-9 shrink-0 place-items-center rounded-lg"
      style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 13%, transparent)` }}
      aria-hidden="true"
    >
      <Icon size={size} />
    </span>
  );
}

function StatCard({
  icon,
  accentVar,
  label,
  value,
  sub,
}: {
  icon: ComponentType<IconProps>;
  accentVar: string;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-4 transition-all hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-md">
      <div className="flex items-center justify-between">
        <AccentTile icon={icon} accentVar={accentVar} />
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight tabular-nums">{value}</p>
        <p className="text-xs font-medium text-muted">{label}</p>
        {sub && <p className="mt-0.5 text-[11px] text-subtle">{sub}</p>}
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  const unset = value === "Not set yet" || value === "—" || value === "";
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">{label}</p>
      <p className={cn("text-sm", mono && "font-mono", unset ? "text-subtle" : "font-medium text-foreground")}>
        {value || "—"}
      </p>
    </div>
  );
}

function QuickAction({
  icon: Icon,
  label,
  sub,
  href,
}: {
  icon: ComponentType<IconProps>;
  label: string;
  sub: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-border bg-background p-3 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon size={17} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-medium">{label}</span>
        <span className="block truncate text-xs text-muted">{sub}</span>
      </span>
      <ArrowRightIcon size={15} className="shrink-0 text-subtle transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}

function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="font-semibold tracking-tight">{children}</h2>
      {action}
    </div>
  );
}

export function ProfileView({ data }: { data: ProfilePageData }) {
  const { identity, career, stats } = data;

  const statCards = [
    { icon: TargetIcon, accentVar: "--accent-assessment", label: "Career Readiness", value: `${stats.careerReadiness}%` },
    { icon: FileTextIcon, accentVar: "--accent-resume", label: "Resume Score", value: `${stats.resumeScore}%` },
    { icon: RouteIcon, accentVar: "--accent-roadmap", label: "Roadmap Progress", value: `${stats.roadmapProgress}%` },
    { icon: MicIcon, accentVar: "--accent-interview", label: "Mock Interview Avg", value: stats.interviewAvg != null ? `${stats.interviewAvg}%` : "—" },
    { icon: PuzzleIcon, accentVar: "--accent-mentor", label: "Skill Gap Progress", value: stats.skillGap != null ? `${stats.skillGap}%` : "—" },
    { icon: SparklesIcon, accentVar: "--accent-mentor", label: "AI Coach Sessions", value: `${stats.coachSessions}` },
    { icon: AwardIcon, accentVar: "--accent-interview", label: "Achievements", value: `${stats.achievementsUnlocked}/${stats.achievementsTotal}` },
    { icon: ChartIcon, accentVar: "--accent-assessment", label: "XP Level", value: `Lv ${stats.level}`, sub: stats.levelTitle },
    { icon: ClockIcon, accentVar: "--accent-roadmap", label: "Learning Streak", value: `${stats.streak} ${stats.streak === 1 ? "day" : "days"}` },
  ];

  return (
    <div className="space-y-8">
      {/* Identity header */}
      <Card className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar name={identity.name} email={identity.email} src={identity.photoURL} size={72} />
          <div className="min-w-0">
            <p className="truncate text-xl font-bold tracking-tight">{identity.name}</p>
            <p className="truncate text-sm text-muted">@{identity.username}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="primary" className="capitalize">{identity.role}</Badge>
              <Badge variant={identity.plan === "pro" ? "primary" : "muted"} className="capitalize">{identity.plan} plan</Badge>
            </div>
          </div>
        </div>
        <Link
          href={ROUTES.portfolio}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium transition-colors hover:bg-foreground/5"
        >
          <EditIcon size={16} /> Edit Profile
        </Link>
      </Card>

      {/* Personal information */}
      <Card className="space-y-5">
        <SectionTitle>Personal Information</SectionTitle>
        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          <Field label="Full Name" value={identity.name} />
          <Field label="Email Address" value={identity.email} />
          <Field label="Username" value={`@${identity.username}`} mono />
          <Field label="Current Plan" value={`${identity.plan[0].toUpperCase()}${identity.plan.slice(1)}`} />
          <Field label="Career Goal" value={career.careerGoal} />
          <Field label="Target Company" value={career.targetCompany} />
          <Field label="Target Role" value={career.targetRole} />
          <Field label="College / University" value={career.college} />
          <Field label="Degree" value={career.degree} />
          <Field label="Graduation Year" value={career.gradYear} />
          <Field label="Joined" value={identity.joined} />
          <Field label="Last Active" value={identity.lastActive} />
        </div>

        <div className="space-y-1.5 border-t border-border pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">Skills</p>
          {career.skills.length ? (
            <div className="flex flex-wrap gap-1.5">
              {career.skills.map((s) => (
                <span key={s} className="inline-flex rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-xs font-medium text-foreground/80">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-subtle">No skills added yet.</p>
          )}
        </div>

        <div className="space-y-1.5 border-t border-border pt-4">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-subtle">Bio</p>
          <p className={cn("text-sm", career.bio ? "text-muted" : "text-subtle")}>
            {career.bio || "Add a short bio in your portfolio to introduce yourself."}
          </p>
        </div>
      </Card>

      {/* Career statistics */}
      <section className="space-y-4">
        <SectionTitle>Career Statistics</SectionTitle>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3">
          {statCards.map((s) => (
            <StatCard key={s.label} icon={s.icon} accentVar={s.accentVar} label={s.label} value={s.value} sub={s.sub} />
          ))}
        </div>
      </section>

      {/* Quick actions */}
      <section className="space-y-4">
        <SectionTitle>Quick Actions</SectionTitle>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <QuickAction icon={EditIcon} label="Edit Profile" sub="Update your portfolio" href={ROUTES.portfolio} />
          <QuickAction icon={FileTextIcon} label="Resume" sub="Build & export" href={ROUTES.resume} />
          <QuickAction icon={RouteIcon} label="Learning Roadmap" sub="Track your plan" href={ROUTES.roadmap} />
          <QuickAction icon={SparklesIcon} label="AI Coach" sub="Get guidance" href={ROUTES.coach} />
          <QuickAction icon={RocketIcon} label="Target Companies" sub="Explore & prepare" href={ROUTES.companies} />
          <ExportProfileButton data={data} />
        </div>
      </section>

      {/* Public profile */}
      <PublicProfileCard data={data} />
    </div>
  );
}
