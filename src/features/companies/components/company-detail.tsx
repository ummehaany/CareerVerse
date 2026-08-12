"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CompassIcon,
  BriefcaseIcon,
  SparklesIcon,
  RouteIcon,
  FileTextIcon,
  MicIcon,
} from "@/components/ui/icon";
import type { CompanyDetailData } from "../types";
import { computeReadiness } from "../analysis";
import { buildCompanyRoadmap } from "../roadmap";
import { matchResume } from "../resume-match";
import { buildInterviewKit } from "../interview";
import { markCompanyViewedAction } from "../actions";
import { CompanyHero } from "./company-hero";
import { OverviewSection } from "./overview-section";
import { RolesSection } from "./roles-section";
import { ReadinessSection } from "./readiness-section";
import { RoadmapSection } from "./roadmap-section";
import { ResumeMatchSection } from "./resume-match-section";
import { InterviewSection } from "./interview-section";

type Tab = "overview" | "roles" | "readiness" | "roadmap" | "resume" | "interview";

const TABS: { key: Tab; label: string; icon: typeof CompassIcon }[] = [
  { key: "overview", label: "Overview", icon: CompassIcon },
  { key: "roles", label: "Roles", icon: BriefcaseIcon },
  { key: "readiness", label: "Readiness", icon: SparklesIcon },
  { key: "roadmap", label: "Roadmap", icon: RouteIcon },
  { key: "resume", label: "Resume Match", icon: FileTextIcon },
  { key: "interview", label: "Interview", icon: MicIcon },
];

export function CompanyDetail({ data }: { data: CompanyDetailData }) {
  const { profile, user } = data;
  const [tab, setTab] = useState<Tab>("overview");
  const [roleKey, setRoleKey] = useState<string>(data.defaultRoleKey);

  useEffect(() => {
    void markCompanyViewedAction(profile.record.slug);
  }, [profile.record.slug]);

  const role = useMemo(
    () => profile.roles.find((r) => r.key === roleKey) ?? profile.roles[0],
    [profile.roles, roleKey],
  );

  const readiness = useMemo(() => computeReadiness(user, profile, role), [user, profile, role]);
  const roadmap = useMemo(() => buildCompanyRoadmap(profile, role, readiness), [profile, role, readiness]);
  const resume = useMemo(() => matchResume(user, profile, role), [user, profile, role]);
  const kit = useMemo(() => buildInterviewKit(profile, role), [profile, role]);

  function analyzeRole(key: string) {
    setRoleKey(key);
    setTab("readiness");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      <CompanyHero
        profile={profile}
        isSaved={data.isSaved}
        isDream={data.isDream}
        readinessScore={readiness.score}
      />

      {/* tab nav */}
      <div className="sticky top-0 z-10 -mx-2 overflow-x-auto bg-surface/80 px-2 py-2 backdrop-blur-sm">
        <div className="flex min-w-max gap-1">
          {TABS.map(({ key, label, icon: Icon }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-pressed={active}
                className={
                  "inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors " +
                  (active ? "bg-foreground text-background" : "text-muted hover:bg-foreground/5 hover:text-foreground")
                }
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* analyzing-for banner on analysis tabs */}
      {(tab === "readiness" || tab === "roadmap" || tab === "resume" || tab === "interview") && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5 text-sm">
          <span className="text-muted">Analyzing for role:</span>
          <select
            value={role.key}
            onChange={(e) => setRoleKey(e.target.value)}
            aria-label="Select role to analyze"
            className="rounded-md border border-foreground/15 bg-transparent px-2 py-1 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
          >
            {profile.roles.map((r) => (
              <option key={r.key} value={r.key}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {tab === "overview" && <OverviewSection profile={profile} />}
      {tab === "roles" && (
        <RolesSection roles={profile.roles} selectedKey={role.key} onSelect={setRoleKey} onAnalyze={analyzeRole} />
      )}
      {tab === "readiness" && <ReadinessSection readiness={readiness} companyName={profile.record.name} />}
      {tab === "roadmap" && <RoadmapSection roadmap={roadmap} />}
      {tab === "resume" && <ResumeMatchSection match={resume} companyName={profile.record.name} />}
      {tab === "interview" && <InterviewSection kit={kit} companyName={profile.record.name} />}
    </div>
  );
}
