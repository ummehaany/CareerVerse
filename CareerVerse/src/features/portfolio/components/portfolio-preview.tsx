"use client";

import type { ReactNode } from "react";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  RocketIcon,
  TargetIcon,
  SparklesIcon,
  BriefcaseIcon,
} from "@/components/ui/icon";
import {
  AwardIcon,
  StarIcon,
  GraduationCapIcon,
  MapPinIcon,
  MailIcon,
  PhoneIcon,
  LinkIcon,
  ExternalLinkIcon,
} from "@/components/ui/icons-extended";
import type { Portfolio, SkillLevel, WorkMode } from "@/types/portfolio";
import type { ProgressOverview as ProgressOverviewData } from "../types";

const LEVEL_LABEL: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

const WORK_MODE_LABEL: Record<Exclude<WorkMode, "">, string> = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
};

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof RocketIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-subtle">
        <Icon size={16} className="text-primary" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function SkillChips({ items }: { items: Portfolio["technicalSkills"] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((s, i) => (
        <span
          key={`${s.name}-${i}`}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-xs font-medium"
        >
          {s.name}
          <span className="text-subtle">· {LEVEL_LABEL[s.level]}</span>
        </span>
      ))}
    </div>
  );
}

function isEmpty(p: Portfolio): boolean {
  return (
    !p.personal.fullName &&
    !p.personal.headline &&
    !p.personal.bio &&
    p.technicalSkills.length === 0 &&
    p.softSkills.length === 0 &&
    p.projects.length === 0 &&
    p.certifications.length === 0 &&
    p.achievements.length === 0 &&
    p.education.length === 0
  );
}

export function PortfolioPreview({
  portfolio,
  progress,
}: {
  portfolio: Portfolio;
  progress: ProgressOverviewData;
}) {
  const p = portfolio;

  if (isEmpty(p)) {
    return (
      <Card className="flex flex-col items-center gap-3 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <BriefcaseIcon size={28} />
        </span>
        <div className="space-y-1">
          <p className="font-medium">Your portfolio is empty</p>
          <p className="mx-auto max-w-md text-sm text-muted">
            Switch to the Edit tab and fill in your details — your shareable
            portfolio will render here.
          </p>
        </div>
      </Card>
    );
  }

  const socials: Array<{ label: string; href: string }> = [
    { label: "LinkedIn", href: p.social.linkedin },
    { label: "GitHub", href: p.social.github },
    { label: "Website", href: p.social.website },
    { label: "X", href: p.social.twitter },
  ].filter((s) => s.href.trim());

  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="space-y-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar
            name={p.personal.fullName}
            email={p.personal.email}
            src={p.personal.photoUrl || null}
            size={84}
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight">
              {p.personal.fullName || "Your name"}
            </h1>
            {p.personal.headline && (
              <p className="mt-0.5 text-base text-muted">{p.personal.headline}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              {p.personal.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPinIcon size={14} /> {p.personal.location}
                </span>
              )}
              {p.personal.email && (
                <a
                  href={`mailto:${p.personal.email}`}
                  className="inline-flex items-center gap-1 hover:text-primary"
                >
                  <MailIcon size={14} /> {p.personal.email}
                </a>
              )}
              {p.personal.phone && (
                <span className="inline-flex items-center gap-1">
                  <PhoneIcon size={14} /> {p.personal.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {p.personal.bio && <p className="text-sm leading-relaxed text-foreground/85">{p.personal.bio}</p>}

        {socials.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
              >
                <LinkIcon size={13} />
                {s.label}
              </a>
            ))}
          </div>
        )}
      </Card>

      {/* Readiness snapshot */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Career readiness" value={`${progress.careerReadiness}`} suffix="/100" highlight />
        <Stat label="Resume" value={`${progress.resumeCompletion}`} suffix="%" />
        <Stat label="Roadmap" value={`${progress.roadmapCompletion}`} suffix="%" />
        <Stat
          label="Interview"
          value={progress.interviewPerformance === null ? "—" : `${progress.interviewPerformance}`}
          suffix={progress.interviewPerformance === null ? "" : "%"}
        />
        <Stat
          label="Skill readiness"
          value={progress.skillReadiness === null ? "—" : `${progress.skillReadiness}`}
          suffix={progress.skillReadiness === null ? "" : "%"}
        />
      </div>

      {/* Career goal */}
      {(p.personal.careerGoal || p.careerGoals.dreamJob) && (
        <Section icon={TargetIcon} title="Career goal">
          <Card className="space-y-2">
            {p.personal.careerGoal && <p className="text-sm text-foreground/85">{p.personal.careerGoal}</p>}
            <div className="flex flex-wrap gap-1.5">
              {p.careerGoals.dreamJob && <Badge variant="primary">{p.careerGoals.dreamJob}</Badge>}
              {p.careerGoals.targetCompany && <Badge variant="muted">{p.careerGoals.targetCompany}</Badge>}
              {p.careerGoals.targetSalary && <Badge variant="muted">{p.careerGoals.targetSalary}</Badge>}
              {p.careerGoals.workMode && (
                <Badge variant="muted">{WORK_MODE_LABEL[p.careerGoals.workMode]}</Badge>
              )}
            </div>
          </Card>
        </Section>
      )}

      {/* Skills */}
      {(p.technicalSkills.length > 0 || p.softSkills.length > 0) && (
        <Section icon={SparklesIcon} title="Skills">
          <Card className="space-y-4">
            {p.technicalSkills.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted">Technical</p>
                <SkillChips items={p.technicalSkills} />
              </div>
            )}
            {p.softSkills.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted">Soft skills</p>
                <SkillChips items={p.softSkills} />
              </div>
            )}
          </Card>
        </Section>
      )}

      {/* Projects */}
      {p.projects.length > 0 && (
        <Section icon={RocketIcon} title="Projects">
          <div className="grid gap-4 md:grid-cols-2">
            {p.projects.map((proj) => (
              <Card key={proj.id} className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold tracking-tight">{proj.name || "Untitled project"}</h3>
                  <div className="flex items-center gap-2 text-subtle">
                    {proj.githubUrl && (
                      <a href={proj.githubUrl} target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-primary">
                        <LinkIcon size={15} />
                      </a>
                    )}
                    {proj.demoUrl && (
                      <a href={proj.demoUrl} target="_blank" rel="noopener noreferrer" aria-label="Live demo" className="hover:text-primary">
                        <ExternalLinkIcon size={15} />
                      </a>
                    )}
                  </div>
                </div>
                {proj.description && <p className="text-sm text-muted">{proj.description}</p>}
                {proj.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {proj.technologies.map((t, i) => (
                      <span
                        key={`${t}-${i}`}
                        className="inline-flex rounded-full border border-border bg-foreground/[0.03] px-2 py-0.5 text-xs text-foreground/75"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Education */}
      {p.education.length > 0 && (
        <Section icon={GraduationCapIcon} title="Education">
          <div className="space-y-3">
            {p.education.map((edu) => (
              <Card key={edu.id} className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <p className="font-medium">{edu.degree || edu.school || "Education"}</p>
                  <p className="text-sm text-muted">
                    {[edu.field, edu.school].filter(Boolean).join(" · ")}
                  </p>
                </div>
                {(edu.startYear || edu.endYear) && (
                  <p className="text-sm text-subtle tabular-nums">
                    {[edu.startYear, edu.endYear].filter(Boolean).join(" – ")}
                  </p>
                )}
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Certifications */}
      {p.certifications.length > 0 && (
        <Section icon={AwardIcon} title="Certifications">
          <div className="grid gap-3 sm:grid-cols-2">
            {p.certifications.map((cert) => (
              <Card key={cert.id} className="space-y-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{cert.name || "Certification"}</p>
                  {cert.credentialUrl && (
                    <a href={cert.credentialUrl} target="_blank" rel="noopener noreferrer" aria-label="Credential" className="text-subtle hover:text-primary">
                      <ExternalLinkIcon size={15} />
                    </a>
                  )}
                </div>
                <p className="text-sm text-muted">
                  {[cert.issuer, cert.issueDate].filter(Boolean).join(" · ")}
                </p>
              </Card>
            ))}
          </div>
        </Section>
      )}

      {/* Achievements */}
      {p.achievements.length > 0 && (
        <Section icon={StarIcon} title="Achievements">
          <div className="space-y-3">
            {p.achievements.map((ach) => (
              <Card key={ach.id} className="space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{ach.title || "Achievement"}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="muted" className="capitalize">
                      {ach.type}
                    </Badge>
                    {ach.date && <span className="text-xs text-subtle tabular-nums">{ach.date}</span>}
                  </div>
                </div>
                {ach.organization && <p className="text-sm text-muted">{ach.organization}</p>}
                {ach.description && <p className="text-sm text-foreground/80">{ach.description}</p>}
              </Card>
            ))}
          </div>
        </Section>
      )}
    </div>
  );
}

function Stat({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string;
  value: string;
  suffix: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-3 text-center">
      <p
        className="text-xl font-bold tabular-nums"
        style={{ color: highlight ? "var(--primary)" : undefined }}
      >
        {value}
        <span className="text-xs font-medium text-subtle">{suffix}</span>
      </p>
      <p className="mt-0.5 text-[11px] font-medium text-muted">{label}</p>
    </div>
  );
}
