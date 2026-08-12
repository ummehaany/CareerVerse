"use client";

import type { ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  UserIcon,
  SparklesIcon,
  RocketIcon,
  TargetIcon,
  PlusIcon,
} from "@/components/ui/icon";
import {
  AwardIcon,
  StarIcon,
  GraduationCapIcon,
  LinkIcon,
  TrashIcon,
} from "@/components/ui/icons-extended";
import type {
  Portfolio,
  PortfolioSkill,
  SkillLevel,
} from "@/types/portfolio";
import { SectionCard, Field, newId } from "./field";
import { ChipInput } from "./chip-input";

const LEVELS: SkillLevel[] = ["beginner", "intermediate", "advanced", "expert"];
const LEVEL_LABEL: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  expert: "Expert",
};

function updateAt<T>(list: T[], index: number, patch: Partial<T>): T[] {
  return list.map((it, i) => (i === index ? { ...it, ...patch } : it));
}
function removeAt<T>(list: T[], index: number): T[] {
  return list.filter((_, i) => i !== index);
}

/* --- small field primitives --- */

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
}) {
  return (
    <Field label={label} hint={hint}>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </Field>
  );
}

function AreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <Textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </Field>
  );
}

function ItemShell({
  title,
  onRemove,
  children,
}: {
  title: string;
  onRemove: () => void;
  children: ReactNode;
}) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{title}</p>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${title}`}
          className="grid h-8 w-8 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-danger/40 hover:text-danger"
        >
          <TrashIcon size={15} />
        </button>
      </div>
      {children}
    </div>
  );
}

function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button type="button" variant="outline" size="sm" onClick={onClick}>
      <PlusIcon size={15} />
      {label}
    </Button>
  );
}

/* --- skills editor (name + level) --- */

function SkillEditor({
  items,
  onChange,
  addLabel,
}: {
  items: PortfolioSkill[];
  onChange: (next: PortfolioSkill[]) => void;
  addLabel: string;
}) {
  return (
    <div className="space-y-2.5">
      {items.length === 0 && (
        <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-subtle">
          No skills added yet.
        </p>
      )}
      {items.map((skill, i) => (
        <div key={i} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <Input
            value={skill.name}
            onChange={(e) => onChange(updateAt(items, i, { name: e.target.value }))}
            placeholder="Skill name"
            aria-label="Skill name"
            className="flex-1"
          />
          <div className="flex items-center gap-2">
            <Select
              value={skill.level}
              onChange={(e) => onChange(updateAt(items, i, { level: e.target.value as SkillLevel }))}
              aria-label="Skill level"
              className="w-40"
            >
              {LEVELS.map((lvl) => (
                <option key={lvl} value={lvl}>
                  {LEVEL_LABEL[lvl]}
                </option>
              ))}
            </Select>
            <button
              type="button"
              onClick={() => onChange(removeAt(items, i))}
              aria-label="Remove skill"
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-danger/40 hover:text-danger"
            >
              <TrashIcon size={15} />
            </button>
          </div>
        </div>
      ))}
      <AddButton
        label={addLabel}
        onClick={() => onChange([...items, { name: "", level: "intermediate" }])}
      />
    </div>
  );
}

/* --- main editor --- */

export function PortfolioEditor({
  value,
  onChange,
}: {
  value: Portfolio;
  onChange: (next: Portfolio) => void;
}) {
  function set<K extends keyof Portfolio>(key: K, val: Portfolio[K]) {
    onChange({ ...value, [key]: val });
  }

  const p = value;

  return (
    <div className="space-y-6">
      {/* 1 — Personal */}
      <SectionCard
        icon={UserIcon}
        title="Personal profile"
        description="Your professional identity — the header of your portfolio."
        accentVar="--accent-assessment"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          {/* photo preview */}
          <span className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-primary/10 text-primary">
            {p.personal.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.personal.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <UserIcon size={26} />
            )}
          </span>
          <div className="flex-1">
            <TextField
              label="Profile picture URL"
              value={p.personal.photoUrl}
              onChange={(v) => set("personal", { ...p.personal, photoUrl: v })}
              placeholder="https://…"
              hint="Paste an image link, or leave blank to use your initials."
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Full name"
            value={p.personal.fullName}
            onChange={(v) => set("personal", { ...p.personal, fullName: v })}
            placeholder="Jane Doe"
          />
          <TextField
            label="Headline"
            value={p.personal.headline}
            onChange={(v) => set("personal", { ...p.personal, headline: v })}
            placeholder="Aspiring Data Scientist"
          />
        </div>

        <AreaField
          label="Bio"
          value={p.personal.bio}
          onChange={(v) => set("personal", { ...p.personal, bio: v })}
          placeholder="A short introduction about who you are and what you're working toward."
        />

        <TextField
          label="Career goal"
          value={p.personal.careerGoal}
          onChange={(v) => set("personal", { ...p.personal, careerGoal: v })}
          placeholder="Become a machine-learning engineer at a product company."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Location"
            value={p.personal.location}
            onChange={(v) => set("personal", { ...p.personal, location: v })}
            placeholder="Bengaluru, India"
          />
          <TextField
            label="Email"
            type="email"
            value={p.personal.email}
            onChange={(v) => set("personal", { ...p.personal, email: v })}
            placeholder="you@example.com"
          />
          <TextField
            label="Phone"
            value={p.personal.phone}
            onChange={(v) => set("personal", { ...p.personal, phone: v })}
            placeholder="+91 …"
          />
        </div>
      </SectionCard>

      {/* 2 — Education */}
      <SectionCard
        icon={GraduationCapIcon}
        title="Education"
        description="Schools, degrees, and programs."
        accentVar="--accent-roadmap"
        actions={
          <AddButton
            label="Add"
            onClick={() =>
              set("education", [
                ...p.education,
                { id: newId("edu"), school: "", degree: "", field: "", startYear: "", endYear: "" },
              ])
            }
          />
        }
      >
        {p.education.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-subtle">
            No education added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {p.education.map((edu, i) => (
              <ItemShell
                key={edu.id}
                title={edu.school || edu.degree || `Education ${i + 1}`}
                onRemove={() => set("education", removeAt(p.education, i))}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="School"
                    value={edu.school}
                    onChange={(v) => set("education", updateAt(p.education, i, { school: v }))}
                    placeholder="University name"
                  />
                  <TextField
                    label="Degree"
                    value={edu.degree}
                    onChange={(v) => set("education", updateAt(p.education, i, { degree: v }))}
                    placeholder="B.Tech, B.Sc, …"
                  />
                  <TextField
                    label="Field of study"
                    value={edu.field}
                    onChange={(v) => set("education", updateAt(p.education, i, { field: v }))}
                    placeholder="Computer Science"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <TextField
                      label="Start year"
                      value={edu.startYear}
                      onChange={(v) => set("education", updateAt(p.education, i, { startYear: v }))}
                      placeholder="2021"
                    />
                    <TextField
                      label="End year"
                      value={edu.endYear}
                      onChange={(v) => set("education", updateAt(p.education, i, { endYear: v }))}
                      placeholder="2025"
                    />
                  </div>
                </div>
              </ItemShell>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 3 — Skills */}
      <SectionCard
        icon={SparklesIcon}
        title="Skills"
        description="Technical and soft skills, each with a proficiency level."
        accentVar="--accent-mentor"
      >
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Technical skills
          </p>
          <SkillEditor
            items={p.technicalSkills}
            onChange={(next) => set("technicalSkills", next)}
            addLabel="Add technical skill"
          />
        </div>
        <div className="space-y-2 border-t border-border pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Soft skills</p>
          <SkillEditor
            items={p.softSkills}
            onChange={(next) => set("softSkills", next)}
            addLabel="Add soft skill"
          />
        </div>
      </SectionCard>

      {/* 4 — Projects */}
      <SectionCard
        icon={RocketIcon}
        title="Projects"
        description="Showcase what you've built."
        accentVar="--accent-interview"
        actions={
          <AddButton
            label="Add"
            onClick={() =>
              set("projects", [
                ...p.projects,
                {
                  id: newId("proj"),
                  name: "",
                  description: "",
                  technologies: [],
                  githubUrl: "",
                  demoUrl: "",
                },
              ])
            }
          />
        }
      >
        {p.projects.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-subtle">
            No projects added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {p.projects.map((proj, i) => (
              <ItemShell
                key={proj.id}
                title={proj.name || `Project ${i + 1}`}
                onRemove={() => set("projects", removeAt(p.projects, i))}
              >
                <TextField
                  label="Project name"
                  value={proj.name}
                  onChange={(v) => set("projects", updateAt(p.projects, i, { name: v }))}
                  placeholder="Portfolio website"
                />
                <AreaField
                  label="Description"
                  value={proj.description}
                  onChange={(v) => set("projects", updateAt(p.projects, i, { description: v }))}
                  placeholder="What it does, your role, and the impact."
                />
                <Field label="Technologies used">
                  <ChipInput
                    value={proj.technologies}
                    onChange={(next) => set("projects", updateAt(p.projects, i, { technologies: next }))}
                    placeholder="Add a technology"
                    ariaLabel="Add technology"
                  />
                </Field>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="GitHub link"
                    value={proj.githubUrl}
                    onChange={(v) => set("projects", updateAt(p.projects, i, { githubUrl: v }))}
                    placeholder="https://github.com/…"
                  />
                  <TextField
                    label="Live demo link"
                    value={proj.demoUrl}
                    onChange={(v) => set("projects", updateAt(p.projects, i, { demoUrl: v }))}
                    placeholder="https://…"
                  />
                </div>
              </ItemShell>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 5 — Certifications */}
      <SectionCard
        icon={AwardIcon}
        title="Certifications"
        description="Credentials you've earned."
        accentVar="--accent-assessment"
        actions={
          <AddButton
            label="Add"
            onClick={() =>
              set("certifications", [
                ...p.certifications,
                { id: newId("cert"), name: "", issuer: "", issueDate: "", credentialUrl: "" },
              ])
            }
          />
        }
      >
        {p.certifications.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-subtle">
            No certifications added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {p.certifications.map((cert, i) => (
              <ItemShell
                key={cert.id}
                title={cert.name || `Certification ${i + 1}`}
                onRemove={() => set("certifications", removeAt(p.certifications, i))}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Certification name"
                    value={cert.name}
                    onChange={(v) => set("certifications", updateAt(p.certifications, i, { name: v }))}
                    placeholder="AWS Certified Cloud Practitioner"
                  />
                  <TextField
                    label="Issuing organization"
                    value={cert.issuer}
                    onChange={(v) => set("certifications", updateAt(p.certifications, i, { issuer: v }))}
                    placeholder="Amazon Web Services"
                  />
                  <TextField
                    label="Issue date"
                    value={cert.issueDate}
                    onChange={(v) => set("certifications", updateAt(p.certifications, i, { issueDate: v }))}
                    placeholder="Mar 2025"
                  />
                  <TextField
                    label="Credential link"
                    value={cert.credentialUrl}
                    onChange={(v) => set("certifications", updateAt(p.certifications, i, { credentialUrl: v }))}
                    placeholder="https://…"
                  />
                </div>
              </ItemShell>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 6 — Achievements */}
      <SectionCard
        icon={StarIcon}
        title="Achievements"
        description="Awards, competitions, internships, and leadership roles."
        accentVar="--accent-interview"
        actions={
          <AddButton
            label="Add"
            onClick={() =>
              set("achievements", [
                ...p.achievements,
                {
                  id: newId("ach"),
                  title: "",
                  type: "award",
                  organization: "",
                  date: "",
                  description: "",
                },
              ])
            }
          />
        }
      >
        {p.achievements.length === 0 ? (
          <p className="rounded-lg border border-dashed border-border px-3 py-4 text-center text-xs text-subtle">
            No achievements added yet.
          </p>
        ) : (
          <div className="space-y-3">
            {p.achievements.map((ach, i) => (
              <ItemShell
                key={ach.id}
                title={ach.title || `Achievement ${i + 1}`}
                onRemove={() => set("achievements", removeAt(p.achievements, i))}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Title"
                    value={ach.title}
                    onChange={(v) => set("achievements", updateAt(p.achievements, i, { title: v }))}
                    placeholder="1st place — National Hackathon"
                  />
                  <Field label="Type">
                    <Select
                      value={ach.type}
                      onChange={(e) =>
                        set(
                          "achievements",
                          updateAt(p.achievements, i, {
                            type: e.target.value as (typeof p.achievements)[number]["type"],
                          }),
                        )
                      }
                      aria-label="Achievement type"
                    >
                      <option value="award">Award</option>
                      <option value="competition">Competition</option>
                      <option value="internship">Internship</option>
                      <option value="leadership">Leadership role</option>
                      <option value="other">Other</option>
                    </Select>
                  </Field>
                  <TextField
                    label="Organization"
                    value={ach.organization}
                    onChange={(v) => set("achievements", updateAt(p.achievements, i, { organization: v }))}
                    placeholder="Where / who"
                  />
                  <TextField
                    label="Date"
                    value={ach.date}
                    onChange={(v) => set("achievements", updateAt(p.achievements, i, { date: v }))}
                    placeholder="2025"
                  />
                </div>
                <AreaField
                  label="Description"
                  value={ach.description}
                  onChange={(v) => set("achievements", updateAt(p.achievements, i, { description: v }))}
                  placeholder="A sentence about what you did and why it mattered."
                />
              </ItemShell>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 7 — Career goals */}
      <SectionCard
        icon={TargetIcon}
        title="Career goals"
        description="Where you're headed."
        accentVar="--accent-roadmap"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Dream job"
            value={p.careerGoals.dreamJob}
            onChange={(v) => set("careerGoals", { ...p.careerGoals, dreamJob: v })}
            placeholder="Machine Learning Engineer"
          />
          <TextField
            label="Target company"
            value={p.careerGoals.targetCompany}
            onChange={(v) => set("careerGoals", { ...p.careerGoals, targetCompany: v })}
            placeholder="Any dream employer"
          />
          <TextField
            label="Target salary"
            value={p.careerGoals.targetSalary}
            onChange={(v) => set("careerGoals", { ...p.careerGoals, targetSalary: v })}
            placeholder="₹ 18 LPA"
          />
          <Field label="Preferred work mode">
            <Select
              value={p.careerGoals.workMode}
              onChange={(e) =>
                set("careerGoals", {
                  ...p.careerGoals,
                  workMode: e.target.value as Portfolio["careerGoals"]["workMode"],
                })
              }
              aria-label="Preferred work mode"
            >
              <option value="">Select…</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">On-site</option>
            </Select>
          </Field>
        </div>
      </SectionCard>

      {/* 8 — Social links */}
      <SectionCard
        icon={LinkIcon}
        title="Social links"
        description="Where people can find you."
        accentVar="--accent-mentor"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="LinkedIn"
            value={p.social.linkedin}
            onChange={(v) => set("social", { ...p.social, linkedin: v })}
            placeholder="https://linkedin.com/in/…"
          />
          <TextField
            label="GitHub"
            value={p.social.github}
            onChange={(v) => set("social", { ...p.social, github: v })}
            placeholder="https://github.com/…"
          />
          <TextField
            label="Portfolio website"
            value={p.social.website}
            onChange={(v) => set("social", { ...p.social, website: v })}
            placeholder="https://…"
          />
          <TextField
            label="X (Twitter)"
            value={p.social.twitter}
            onChange={(v) => set("social", { ...p.social, twitter: v })}
            placeholder="https://x.com/…"
          />
        </div>
      </SectionCard>
    </div>
  );
}
