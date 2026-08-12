import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  TargetIcon,
  RocketIcon,
  ChartIcon,
  MicIcon,
  RouteIcon,
  SparklesIcon,
  ClockIcon,
  PuzzleIcon,
  FileTextIcon,
} from "@/components/ui/icon";
import { AwardIcon, StarIcon, ExternalLinkIcon, LinkIcon, MapPinIcon, GraduationCapIcon } from "@/components/ui/icons-extended";
import { ROUTES } from "@/config/routes";
import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import type { PublicProfileData } from "../types";
import { ShareBar } from "./share-bar";
import { ResumeActions } from "./resume-actions";

/* ── small presentational helpers ───────────────────────────────────────────*/

function Section({ id, icon: Icon, title, children }: { id: string; icon: ComponentType<IconProps>; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={`${id}-h`} className="rounded-3xl border border-border bg-background p-6 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary"><Icon size={16} /></span>
        <h2 id={`${id}-h`} className="text-lg font-bold tracking-tight">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Ring({ score }: { score: number }) {
  const r = 54;
  const c = 2 * Math.PI * r;
  const dash = (Math.max(0, Math.min(100, score)) / 100) * c;
  return (
    <div className="relative h-36 w-36 shrink-0">
      <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="12" className="stroke-foreground/10" />
        <circle cx="64" cy="64" r={r} fill="none" strokeWidth="12" strokeLinecap="round" stroke="var(--primary)" strokeDasharray={`${dash} ${c}`} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-extrabold tabular-nums">{score}</span>
        <span className="text-xs text-muted">/ 100</span>
      </div>
    </div>
  );
}

function Bar({ label, value }: { label: string; value: number | null }) {
  const v = value == null ? 0 : Math.max(0, Math.min(100, value));
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-muted">{label}</span>
        <span className="font-bold tabular-nums">{value == null ? "—" : `${Math.round(v)}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-foreground/10">
        <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">{children}</span>;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, { month: "short", year: "numeric" });
  } catch {
    return "";
  }
}

/* ── main view ──────────────────────────────────────────────────────────────*/

export function PublicProfileView({ data }: { data: PublicProfileData }) {
  const s = data.sections;
  const socials = [
    data.social.linkedin && { href: data.social.linkedin, label: "LinkedIn" },
    data.social.github && { href: data.social.github, label: "GitHub" },
    data.social.website && { href: data.social.website, label: "Website" },
    data.social.twitter && { href: data.social.twitter, label: "X" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <div className="min-h-screen bg-foreground/[0.02] pb-16">
      {/* Cover banner */}
      <div
        className="h-44 w-full sm:h-56"
        style={{ background: "linear-gradient(120deg, var(--accent-assessment), var(--accent-mentor))" }}
        aria-hidden="true"
      />

      <div className="mx-auto -mt-20 max-w-4xl space-y-6 px-4">
        {/* Hero */}
        <header className="rounded-3xl border border-border bg-background p-6 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <div className="rounded-2xl border-4 border-background bg-background shadow-md">
              <Avatar name={data.name} src={data.photoUrl} size={104} className="rounded-xl" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{data.name}</h1>
                {data.isOwner && <Badge variant="muted">This is your profile</Badge>}
              </div>
              <p className="mt-1 text-base font-medium text-foreground/80">{data.headline}</p>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
                {data.location && <span className="inline-flex items-center gap-1"><MapPinIcon size={14} /> {data.location}</span>}
                {data.education && <span className="inline-flex items-center gap-1"><GraduationCapIcon size={14} /> {data.education}</span>}
                {data.currentRole && <span className="inline-flex items-center gap-1"><TargetIcon size={14} /> {data.currentRole}</span>}
              </div>
            </div>
          </div>

          {data.bio && <p className="mt-4 text-sm leading-relaxed text-foreground/80">{data.bio}</p>}

          <div className="mt-4 flex flex-wrap gap-2">
            {data.careerGoal && data.careerGoal !== "Not set yet" && (
              <Badge variant="primary"><TargetIcon size={12} /> Goal: {data.careerGoal}</Badge>
            )}
            {data.dreamCompany && <Badge variant="muted"><RocketIcon size={12} /> Dream: {data.dreamCompany}</Badge>}
          </div>

          {socials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((so) => (
                <a key={so.label} href={so.href} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-3 text-sm font-medium transition-colors hover:bg-foreground/5">
                  <LinkIcon size={14} /> {so.label}
                </a>
              ))}
            </div>
          )}

          <div className="mt-5 border-t border-border pt-4">
            <ShareBar url={data.profileUrl} name={data.name} username={data.username} />
          </div>
          {data.isOwner && (
            <p className="mt-3 text-xs text-subtle">
              Manage visibility, sections, and see your private stats in{" "}
              <Link href={ROUTES.settings} className="text-primary underline">Settings</Link>.
            </p>
          )}
        </header>

        {/* Recruiter snapshot */}
        <Section id="recruiter" icon={SparklesIcon} title="Recruiter snapshot">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Career goal</p>
              <p className="mt-1 text-sm font-semibold">{data.careerGoal}</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Career Health</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">{data.healthScore}/100</p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">Interviews</p>
              <p className="mt-1 text-sm font-semibold tabular-nums">
                {data.interview.count} taken{data.interview.best != null ? ` · best ${data.interview.best}` : ""}
              </p>
            </div>
          </div>
          {data.skills.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Top skills</p>
              <div className="flex flex-wrap gap-2">{data.skills.slice(0, 8).map((sk) => <Chip key={sk.name}>{sk.name}</Chip>)}</div>
            </div>
          )}
          {s.resume && data.resume.exists && (
            <div className="mt-4"><ResumeActions username={data.username} /></div>
          )}
        </Section>

        {/* AI summary */}
        {s.aiSummary && data.aiSummary && (
          <Section id="ai" icon={SparklesIcon} title="AI career summary">
            <p className="text-sm leading-relaxed text-foreground/85">{data.aiSummary}</p>
          </Section>
        )}

        {/* Career Health Score */}
        {s.healthScore && (
          <Section id="health" icon={ChartIcon} title="Career Health Score">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
              <Ring score={data.healthScore} />
              <div className="grid flex-1 gap-3 sm:grid-cols-1">
                {data.healthBreakdown.map((cat) => <Bar key={cat.key} label={cat.label} value={cat.value} />)}
              </div>
            </div>
          </Section>
        )}

        {/* Skills */}
        {s.skills && data.skills.length > 0 && (
          <Section id="skills" icon={PuzzleIcon} title="Skills">
            <div className="grid gap-3 sm:grid-cols-2">
              {data.skills.map((sk) => (
                <div key={sk.name} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{sk.name}</p>
                    <Badge variant="muted" className="capitalize">{sk.level}</Badge>
                  </div>
                  {sk.endorsement && <p className="mt-1.5 text-xs text-muted">{sk.endorsement}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Projects */}
        {s.projects && data.projects.length > 0 && (
          <Section id="projects" icon={RocketIcon} title="Projects">
            <div className="grid gap-4 sm:grid-cols-2">
              {data.projects.map((pr) => (
                <article key={pr.id} className="flex flex-col overflow-hidden rounded-2xl border border-border">
                  <div className="flex h-24 items-center justify-center text-2xl font-black text-white" style={{ background: "linear-gradient(120deg, var(--accent-assessment), var(--accent-resume))" }} aria-hidden="true">
                    {pr.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{pr.name}</h3>
                      {pr.featured && <Badge variant="primary">Featured</Badge>}
                    </div>
                    {pr.description && <p className="mt-1 line-clamp-3 text-sm text-muted">{pr.description}</p>}
                    {pr.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1.5">{pr.technologies.slice(0, 6).map((t) => <Chip key={t}>{t}</Chip>)}</div>
                    )}
                    <div className="mt-3 flex flex-wrap gap-2 pt-1">
                      {pr.githubUrl && <a href={pr.githubUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"><LinkIcon size={13} /> Code</a>}
                      {pr.demoUrl && <a href={pr.demoUrl} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"><ExternalLinkIcon size={13} /> Live demo</a>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </Section>
        )}

        {/* Resume */}
        {s.resume && data.resume.exists && (
          <Section id="resume" icon={FileTextIcon} title="Resume">
            {data.resume.summary && <p className="mb-3 text-sm leading-relaxed text-foreground/80">{data.resume.summary}</p>}
            <div className="mb-4 flex flex-wrap gap-2">
              <Badge variant="muted">{data.resume.completion}% complete</Badge>
              {data.resume.atsScore != null && <Badge variant="muted">ATS {data.resume.atsScore}</Badge>}
              {data.resume.experienceCount > 0 && <Badge variant="muted">{data.resume.experienceCount} roles</Badge>}
              {data.resume.lastUpdated && <Badge variant="muted">Updated {fmtDate(data.resume.lastUpdated)}</Badge>}
            </div>
            <ResumeActions username={data.username} />
          </Section>
        )}

        {/* Interview performance */}
        {s.interview && data.interview.count > 0 && (
          <Section id="interview" icon={MicIcon} title="Interview performance">
            <div className="grid gap-3 sm:grid-cols-3">
              <Stat label="Mock interviews" value={`${data.interview.count}`} />
              <Stat label="Average score" value={data.interview.average != null ? `${data.interview.average}` : "—"} />
              <Stat label="Best score" value={data.interview.best != null ? `${data.interview.best}` : "—"} />
            </div>
            {(data.interview.strong.length > 0 || data.interview.improve.length > 0) && (
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {data.interview.strong.length > 0 && (
                  <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Strongest areas</p><div className="flex flex-wrap gap-2">{data.interview.strong.slice(0, 6).map((x) => <Chip key={x}>{x}</Chip>)}</div></div>
                )}
                {data.interview.improve.length > 0 && (
                  <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Improvement areas</p><div className="flex flex-wrap gap-2">{data.interview.improve.slice(0, 6).map((x) => <Chip key={x}>{x}</Chip>)}</div></div>
                )}
              </div>
            )}
          </Section>
        )}

        {/* Roadmap */}
        {s.roadmap && data.roadmap.exists && (
          <Section id="roadmap" icon={RouteIcon} title="Roadmap progress">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium">{data.roadmap.title ?? "Learning roadmap"}</span>
              <span className="font-bold tabular-nums">{data.roadmap.percent}%</span>
            </div>
            <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-foreground/10"><div className="h-full rounded-full bg-primary" style={{ width: `${data.roadmap.percent}%` }} /></div>
            <p className="text-xs text-muted">{data.roadmap.milestonesDone} of {data.roadmap.milestonesTotal} milestones completed</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {data.roadmap.completed.length > 0 && (
                <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Recently completed</p><ul className="space-y-1.5">{data.roadmap.completed.map((m, i) => <li key={i} className="text-sm text-foreground/80">✓ {m}</li>)}</ul></div>
              )}
              {data.roadmap.upcoming.length > 0 && (
                <div><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">Up next</p><ul className="space-y-1.5">{data.roadmap.upcoming.map((m, i) => <li key={i} className="text-sm text-muted">○ {m}</li>)}</ul></div>
              )}
            </div>
          </Section>
        )}

        {/* Target companies */}
        {s.targetCompanies && data.targetCompanies.length > 0 && (
          <Section id="companies" icon={TargetIcon} title="Target companies">
            <div className="grid gap-4 sm:grid-cols-2">
              {data.targetCompanies.map((co) => (
                <div key={co.name} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold">{co.name}</p>
                    <Badge variant={co.score >= 70 ? "success" : "muted"}>{co.score}% ready</Badge>
                  </div>
                  {co.missing.length > 0 && (
                    <p className="mt-2 text-xs text-muted"><span className="font-semibold">Missing:</span> {co.missing.join(", ")}</p>
                  )}
                  {co.nextSteps && <p className="mt-1 text-xs text-muted">{co.nextSteps}</p>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Certifications */}
        {s.certifications && data.certifications.length > 0 && (
          <Section id="certs" icon={AwardIcon} title="Certifications">
            <div className="grid gap-3 sm:grid-cols-2">
              {data.certifications.map((c) => (
                <div key={c.id} className="rounded-2xl border border-border p-4">
                  <p className="font-semibold">{c.name}</p>
                  <p className="text-sm text-muted">{[c.issuer, c.issueDate].filter(Boolean).join(" · ")}</p>
                  {c.credentialUrl && <a href={c.credentialUrl} target="_blank" rel="noopener noreferrer nofollow" className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"><ExternalLinkIcon size={13} /> Verify</a>}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Achievements */}
        {s.achievements && data.achievements.length > 0 && (
          <Section id="achievements" icon={StarIcon} title="Achievements">
            <div className="grid gap-3 sm:grid-cols-2">
              {data.achievements.map((a) => (
                <div key={a.id} className="flex items-start gap-3 rounded-2xl border border-border p-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><AwardIcon size={18} /></span>
                  <div><p className="font-semibold">{a.title}</p><p className="text-xs text-muted">{a.description}</p></div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Timeline */}
        {s.timeline && data.timeline.length > 0 && (
          <Section id="timeline" icon={ClockIcon} title="Career timeline">
            <ol className="relative space-y-4 border-l border-border pl-5">
              {data.timeline.map((ev) => (
                <li key={ev.id} className="relative">
                  <span className="absolute -left-[23px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" aria-hidden="true" />
                  <p className="text-sm font-semibold">{ev.title}</p>
                  {ev.detail && <p className="text-xs text-muted">{ev.detail}</p>}
                  <p className="text-[11px] text-subtle">{fmtDate(ev.at)}</p>
                </li>
              ))}
            </ol>
          </Section>
        )}

        {/* Footer */}
        <footer className="pt-2 text-center text-xs text-subtle">
          <Link href={ROUTES.home} className="font-semibold text-foreground/70 hover:text-foreground">CareerVerse AI</Link>
          <span> · Experience your future before choosing it.</span>
        </footer>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border p-4 text-center">
      <p className="text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}
