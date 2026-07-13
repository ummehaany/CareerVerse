"use client";

import { type Dispatch, type SetStateAction, useId, useState } from "react";
import type {
  ResumeData,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
  ResumeCertification,
} from "@/types/resume";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "@/components/ui/icon";
import { TrashIcon } from "@/components/ui/icons-extended";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  const id = useId();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function SectionCard({
  title,
  children,
  onAdd,
  addLabel,
}: {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-semibold tracking-tight">{title}</h2>
        {onAdd && (
          <Button variant="outline" size="sm" onClick={onAdd}>
            <PlusIcon size={15} />
            {addLabel ?? "Add"}
          </Button>
        )}
      </div>
      {children}
    </section>
  );
}

function EntryShell({ onRemove, children }: { onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border p-3.5">
      <div className="space-y-3">{children}</div>
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 text-xs font-medium text-danger hover:underline"
        >
          <TrashIcon size={14} />
          Remove
        </button>
      </div>
    </div>
  );
}

export function ResumeEditor({
  value,
  setValue,
}: {
  value: ResumeData;
  setValue: Dispatch<SetStateAction<ResumeData>>;
}) {
  const [skillDraft, setSkillDraft] = useState("");

  const setContact = (key: keyof ResumeData["contact"], v: string) =>
    setValue((prev) => ({ ...prev, contact: { ...prev.contact, [key]: v } }));

  function addSkill() {
    const skill = skillDraft.trim();
    if (!skill) return;
    if (!value.skills.some((s) => s.toLowerCase() === skill.toLowerCase())) {
      setValue((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
    }
    setSkillDraft("");
  }

  function updateList<T extends { id: string }>(
    key: "experience" | "education" | "projects" | "certifications",
    id: string,
    patch: Partial<T>,
  ) {
    setValue((prev) => ({
      ...prev,
      [key]: (prev[key] as unknown as T[]).map((item) =>
        item.id === id ? { ...item, ...patch } : item,
      ),
    }));
  }

  function removeFromList(
    key: "experience" | "education" | "projects" | "certifications",
    id: string,
  ) {
    setValue((prev) => ({
      ...prev,
      [key]: (prev[key] as Array<{ id: string }>).filter((item) => item.id !== id),
    }));
  }

  return (
    <div className="space-y-4">
      <SectionCard title="Contact">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Full name" value={value.contact.fullName} onChange={(v) => setContact("fullName", v)} />
          <Field label="Headline" value={value.contact.headline} onChange={(v) => setContact("headline", v)} placeholder="e.g. Frontend Developer" />
          <Field label="Email" value={value.contact.email} onChange={(v) => setContact("email", v)} type="email" />
          <Field label="Phone" value={value.contact.phone} onChange={(v) => setContact("phone", v)} />
          <Field label="Location" value={value.contact.location} onChange={(v) => setContact("location", v)} placeholder="City, Country" />
          <Field label="Website" value={value.contact.website} onChange={(v) => setContact("website", v)} />
          <Field label="LinkedIn" value={value.contact.linkedin} onChange={(v) => setContact("linkedin", v)} />
        </div>
      </SectionCard>

      <SectionCard title="Professional summary">
        <Textarea
          value={value.summary}
          onChange={(e) => setValue((prev) => ({ ...prev, summary: e.target.value }))}
          placeholder="A concise 2–3 sentence summary of your experience and strengths."
          rows={4}
        />
      </SectionCard>

      <SectionCard title="Skills">
        <div className="flex flex-wrap gap-1.5">
          {value.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-xs"
            >
              {skill}
              <button
                type="button"
                onClick={() => setValue((prev) => ({ ...prev, skills: prev.skills.filter((s) => s !== skill) }))}
                aria-label={`Remove ${skill}`}
                className="text-subtle hover:text-danger"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-3">
          <Input
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Add a skill and press Enter"
            aria-label="Add a skill"
          />
        </div>
      </SectionCard>

      <SectionCard
        title="Experience"
        addLabel="Add role"
        onAdd={() =>
          setValue((prev) => ({
            ...prev,
            experience: [
              ...prev.experience,
              {
                id: newId(),
                role: "",
                company: "",
                location: "",
                startDate: "",
                endDate: "",
                current: false,
                bullets: [],
              } satisfies ResumeExperience,
            ],
          }))
        }
      >
        <div className="space-y-3">
          {value.experience.length === 0 && (
            <p className="text-sm text-subtle">No experience added yet.</p>
          )}
          {value.experience.map((exp) => (
            <EntryShell key={exp.id} onRemove={() => removeFromList("experience", exp.id)}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Role" value={exp.role} onChange={(v) => updateList<ResumeExperience>("experience", exp.id, { role: v })} />
                <Field label="Company" value={exp.company} onChange={(v) => updateList<ResumeExperience>("experience", exp.id, { company: v })} />
                <Field label="Location" value={exp.location} onChange={(v) => updateList<ResumeExperience>("experience", exp.id, { location: v })} />
                <Field label="Start" value={exp.startDate} onChange={(v) => updateList<ResumeExperience>("experience", exp.id, { startDate: v })} placeholder="Jan 2023" />
                <Field label="End" value={exp.endDate} onChange={(v) => updateList<ResumeExperience>("experience", exp.id, { endDate: v })} placeholder="Present" />
              </div>
              <label className="flex items-center gap-2 text-sm text-muted">
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateList<ResumeExperience>("experience", exp.id, { current: e.target.checked })}
                />
                I currently work here
              </label>
              <div className="space-y-1.5">
                <Label>Highlights (one per line)</Label>
                <Textarea
                  value={exp.bullets.join("\n")}
                  onChange={(e) =>
                    updateList<ResumeExperience>("experience", exp.id, {
                      bullets: e.target.value.split("\n"),
                    })
                  }
                  placeholder={"Led …\nBuilt …\nImproved …"}
                  rows={3}
                />
              </div>
            </EntryShell>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Education"
        addLabel="Add education"
        onAdd={() =>
          setValue((prev) => ({
            ...prev,
            education: [
              ...prev.education,
              {
                id: newId(),
                degree: "",
                school: "",
                location: "",
                startDate: "",
                endDate: "",
                details: "",
              } satisfies ResumeEducation,
            ],
          }))
        }
      >
        <div className="space-y-3">
          {value.education.length === 0 && <p className="text-sm text-subtle">No education added yet.</p>}
          {value.education.map((edu) => (
            <EntryShell key={edu.id} onRemove={() => removeFromList("education", edu.id)}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Degree" value={edu.degree} onChange={(v) => updateList<ResumeEducation>("education", edu.id, { degree: v })} />
                <Field label="School" value={edu.school} onChange={(v) => updateList<ResumeEducation>("education", edu.id, { school: v })} />
                <Field label="Start" value={edu.startDate} onChange={(v) => updateList<ResumeEducation>("education", edu.id, { startDate: v })} />
                <Field label="End" value={edu.endDate} onChange={(v) => updateList<ResumeEducation>("education", edu.id, { endDate: v })} />
              </div>
              <Field label="Details" value={edu.details} onChange={(v) => updateList<ResumeEducation>("education", edu.id, { details: v })} placeholder="Honors, GPA, focus…" />
            </EntryShell>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Projects"
        addLabel="Add project"
        onAdd={() =>
          setValue((prev) => ({
            ...prev,
            projects: [
              ...prev.projects,
              { id: newId(), name: "", description: "", link: "" } satisfies ResumeProject,
            ],
          }))
        }
      >
        <div className="space-y-3">
          {value.projects.length === 0 && <p className="text-sm text-subtle">No projects added yet.</p>}
          {value.projects.map((project) => (
            <EntryShell key={project.id} onRemove={() => removeFromList("projects", project.id)}>
              <Field label="Name" value={project.name} onChange={(v) => updateList<ResumeProject>("projects", project.id, { name: v })} />
              <Field label="Link" value={project.link} onChange={(v) => updateList<ResumeProject>("projects", project.id, { link: v })} />
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={project.description}
                  onChange={(e) => updateList<ResumeProject>("projects", project.id, { description: e.target.value })}
                  rows={2}
                />
              </div>
            </EntryShell>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Certifications"
        addLabel="Add certification"
        onAdd={() =>
          setValue((prev) => ({
            ...prev,
            certifications: [
              ...prev.certifications,
              { id: newId(), name: "", issuer: "", year: "" } satisfies ResumeCertification,
            ],
          }))
        }
      >
        <div className="space-y-3">
          {value.certifications.length === 0 && (
            <p className="text-sm text-subtle">No certifications added yet.</p>
          )}
          {value.certifications.map((cert) => (
            <EntryShell key={cert.id} onRemove={() => removeFromList("certifications", cert.id)}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Name" value={cert.name} onChange={(v) => updateList<ResumeCertification>("certifications", cert.id, { name: v })} />
                <Field label="Issuer" value={cert.issuer} onChange={(v) => updateList<ResumeCertification>("certifications", cert.id, { issuer: v })} />
                <Field label="Year" value={cert.year} onChange={(v) => updateList<ResumeCertification>("certifications", cert.id, { year: v })} />
              </div>
            </EntryShell>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
