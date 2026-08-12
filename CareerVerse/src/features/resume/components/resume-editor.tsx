"use client";

import { type Dispatch, type SetStateAction, useId, useState } from "react";
import type {
  ResumeData,
  ResumeExperience,
  ResumeEducation,
  ResumeProject,
  ResumeCertification,
  ResumeLanguage,
  ResumeReference,
} from "@/types/resume";
import type { ResumeAssistResult } from "../ai-actions";
import {
  emptyExperience,
  emptyEducation,
  emptyProject,
  emptyCertification,
  emptyLanguage,
  emptyReference,
} from "../defaults";
import { AiAssistButton } from "./ai-assist-button";
import { PhotoInput } from "./photo-input";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { PlusIcon } from "@/components/ui/icon";
import { TrashIcon } from "@/components/ui/icons-extended";
import { cn } from "@/lib/utils";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
  hint?: string;
}) {
  const id = useId();
  const invalid = required && !value.trim();
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="flex items-center gap-1">
        {label}
        {required && <span className="text-danger">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        title={hint}
        aria-invalid={invalid || undefined}
      />
      {invalid && <p className="text-xs text-danger">This field is required.</p>}
    </div>
  );
}

function SectionCard({
  title,
  children,
  onAdd,
  addLabel,
  action,
  hint,
}: {
  title: string;
  children: React.ReactNode;
  onAdd?: () => void;
  addLabel?: string;
  action?: React.ReactNode;
  hint?: string;
}) {
  return (
    <section className="rounded-xl border border-border bg-background p-4 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="font-semibold tracking-tight" title={hint}>
          {title}
        </h2>
        <div className="flex items-center gap-2">
          {action}
          {onAdd && (
            <Button variant="outline" size="sm" onClick={onAdd}>
              <PlusIcon size={15} />
              {addLabel ?? "Add"}
            </Button>
          )}
        </div>
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

/** Reusable tag input used by Skills, Achievements, and Interests. */
function TagEditor({
  items,
  onChange,
  placeholder,
  ariaLabel,
}: {
  items: string[];
  onChange: (next: string[]) => void;
  placeholder: string;
  ariaLabel: string;
}) {
  const [draft, setDraft] = useState("");
  function add() {
    const v = draft.trim();
    if (!v) return;
    if (!items.some((s) => s.toLowerCase() === v.toLowerCase())) onChange([...items, v]);
    setDraft("");
  }
  return (
    <>
      {items.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-foreground/[0.03] px-2.5 py-1 text-xs"
            >
              {item}
              <button
                type="button"
                onClick={() => onChange(items.filter((s) => s !== item))}
                aria-label={`Remove ${item}`}
                className="text-subtle hover:text-danger"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
      <Input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        }}
        placeholder={placeholder}
        aria-label={ariaLabel}
      />
    </>
  );
}

export function ResumeEditor({
  value,
  setValue,
}: {
  value: ResumeData;
  setValue: Dispatch<SetStateAction<ResumeData>>;
}) {
  const [aiNote, setAiNote] = useState<string | null>(null);

  function note(msg: string) {
    setAiNote(msg);
    window.setTimeout(() => setAiNote((cur) => (cur === msg ? null : cur)), 4000);
  }

  const setContact = (key: keyof ResumeData["contact"], v: string) =>
    setValue((prev) => ({ ...prev, contact: { ...prev.contact, [key]: v } }));

  function updateList<T extends { id: string }>(
    key: "experience" | "education" | "projects" | "certifications" | "languages" | "references",
    id: string,
    patch: Partial<T>,
  ) {
    setValue((prev) => ({
      ...prev,
      [key]: (prev[key] as unknown as T[]).map((item) => (item.id === id ? { ...item, ...patch } : item)),
    }));
  }

  function removeFromList(
    key: "experience" | "education" | "projects" | "certifications" | "languages" | "references",
    id: string,
  ) {
    setValue((prev) => ({
      ...prev,
      [key]: (prev[key] as Array<{ id: string }>).filter((item) => item.id !== id),
    }));
  }

  function handleTextResult(apply: (text: string) => void, r: ResumeAssistResult) {
    if (r.ok && r.kind === "text") {
      apply(r.text);
      note(r.source === "ai" ? "Generated with AI." : "Generated with the built-in writer.");
    } else if (!r.ok) {
      note(r.error);
    }
  }

  return (
    <div className="space-y-4">
      {aiNote && <Alert variant="info">{aiNote}</Alert>}

      <SectionCard title="Personal information">
        <div className="mb-4">
          <PhotoInput
            value={value.contact.photo}
            name={value.contact.fullName || value.contact.email}
            onChange={(v) => setContact("photo", v)}
          />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Field label="Full name" value={value.contact.fullName} onChange={(v) => setContact("fullName", v)} required />
          <Field
            label="Professional title"
            value={value.contact.headline}
            onChange={(v) => setContact("headline", v)}
            placeholder="e.g. Frontend Developer"
            hint="The role you're targeting — used by AI and ATS scoring."
          />
          <Field label="Email" value={value.contact.email} onChange={(v) => setContact("email", v)} type="email" required />
          <Field label="Phone" value={value.contact.phone} onChange={(v) => setContact("phone", v)} />
          <Field label="Location" value={value.contact.location} onChange={(v) => setContact("location", v)} placeholder="City, Country" />
          <Field label="LinkedIn" value={value.contact.linkedin} onChange={(v) => setContact("linkedin", v)} placeholder="linkedin.com/in/…" />
          <Field label="GitHub" value={value.contact.github} onChange={(v) => setContact("github", v)} placeholder="github.com/…" />
          <Field label="Portfolio website" value={value.contact.website} onChange={(v) => setContact("website", v)} placeholder="yoursite.com" />
        </div>
      </SectionCard>

      <SectionCard
        title="Professional summary"
        hint="2–3 sentences. Use AI to draft or polish it."
        action={
          <>
            <AiAssistButton
              label="Generate"
              getInput={() => ({ task: "summary", resume: value })}
              onResult={(r) => handleTextResult((text) => setValue((prev) => ({ ...prev, summary: text })), r)}
            />
            {value.summary.trim() && (
              <AiAssistButton
                label="Improve"
                getInput={() => ({ task: "improveText", resume: value, text: value.summary })}
                onResult={(r) => handleTextResult((text) => setValue((prev) => ({ ...prev, summary: text })), r)}
              />
            )}
          </>
        }
      >
        <Textarea
          value={value.summary}
          onChange={(e) => setValue((prev) => ({ ...prev, summary: e.target.value }))}
          placeholder="A concise 2–3 sentence summary of your experience and strengths."
          rows={4}
        />
      </SectionCard>

      <SectionCard
        title="Skills"
        hint="Add relevant, ATS-valuable skills. Aim for 8–12."
        action={
          <AiAssistButton
            label="Suggest skills"
            getInput={() => ({ task: "suggestSkills", resume: value })}
            onResult={(r) => {
              if (r.ok && r.kind === "list") {
                setValue((prev) => {
                  const existing = new Set(prev.skills.map((s) => s.toLowerCase()));
                  const additions = r.items.filter((s) => !existing.has(s.toLowerCase()));
                  return { ...prev, skills: [...prev.skills, ...additions] };
                });
                note(r.source === "ai" ? "Added AI-suggested skills." : "Added suggested skills.");
              } else if (!r.ok) {
                note(r.error);
              }
            }}
          />
        }
      >
        <TagEditor
          items={value.skills}
          onChange={(next) => setValue((prev) => ({ ...prev, skills: next }))}
          placeholder="Add a skill and press Enter"
          ariaLabel="Add a skill"
        />
      </SectionCard>

      <SectionCard
        title="Experience"
        addLabel="Add role"
        onAdd={() => setValue((prev) => ({ ...prev, experience: [...prev.experience, emptyExperience()] }))}
      >
        <div className="space-y-3">
          {value.experience.length === 0 && <p className="text-sm text-subtle">No experience added yet.</p>}
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
                <div className="flex items-center justify-between gap-2">
                  <Label>Highlights (one per line)</Label>
                  {exp.bullets.some((b) => b.trim()) && (
                    <AiAssistButton
                      label="Improve bullets"
                      variant="ghost"
                      getInput={() => ({ task: "improveBullets", resume: value, experienceId: exp.id })}
                      onResult={(r) => {
                        if (r.ok && r.kind === "list") {
                          updateList<ResumeExperience>("experience", exp.id, { bullets: r.items });
                          note(r.source === "ai" ? "Improved bullets with AI." : "Polished bullets.");
                        } else if (!r.ok) {
                          note(r.error);
                        }
                      }}
                    />
                  )}
                </div>
                <Textarea
                  value={exp.bullets.join("\n")}
                  onChange={(e) => updateList<ResumeExperience>("experience", exp.id, { bullets: e.target.value.split("\n") })}
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
        onAdd={() => setValue((prev) => ({ ...prev, education: [...prev.education, emptyEducation()] }))}
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
        onAdd={() => setValue((prev) => ({ ...prev, projects: [...prev.projects, emptyProject()] }))}
      >
        <div className="space-y-3">
          {value.projects.length === 0 && <p className="text-sm text-subtle">No projects added yet.</p>}
          {value.projects.map((project) => (
            <EntryShell key={project.id} onRemove={() => removeFromList("projects", project.id)}>
              <Field label="Name" value={project.name} onChange={(v) => updateList<ResumeProject>("projects", project.id, { name: v })} />
              <Field label="Link" value={project.link} onChange={(v) => updateList<ResumeProject>("projects", project.id, { link: v })} />
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <Label>Description</Label>
                  {project.description.trim() && (
                    <AiAssistButton
                      label="Improve"
                      variant="ghost"
                      getInput={() => ({ task: "improveText", resume: value, text: project.description })}
                      onResult={(r) => {
                        if (r.ok && r.kind === "text") {
                          updateList<ResumeProject>("projects", project.id, { description: r.text });
                          note(r.source === "ai" ? "Improved with AI." : "Polished description.");
                        } else if (!r.ok) {
                          note(r.error);
                        }
                      }}
                    />
                  )}
                </div>
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
        onAdd={() => setValue((prev) => ({ ...prev, certifications: [...prev.certifications, emptyCertification()] }))}
      >
        <div className="space-y-3">
          {value.certifications.length === 0 && <p className="text-sm text-subtle">No certifications added yet.</p>}
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

      <SectionCard title="Achievements" hint="Awards, recognitions, standout wins.">
        <TagEditor
          items={value.achievements}
          onChange={(next) => setValue((prev) => ({ ...prev, achievements: next }))}
          placeholder="Add an achievement and press Enter"
          ariaLabel="Add an achievement"
        />
      </SectionCard>

      <SectionCard
        title="Languages"
        addLabel="Add language"
        onAdd={() => setValue((prev) => ({ ...prev, languages: [...prev.languages, emptyLanguage()] }))}
      >
        <div className="space-y-3">
          {value.languages.length === 0 && <p className="text-sm text-subtle">No languages added yet.</p>}
          {value.languages.map((lang) => (
            <EntryShell key={lang.id} onRemove={() => removeFromList("languages", lang.id)}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Field label="Language" value={lang.name} onChange={(v) => updateList<ResumeLanguage>("languages", lang.id, { name: v })} />
                <Field label="Proficiency" value={lang.level} onChange={(v) => updateList<ResumeLanguage>("languages", lang.id, { level: v })} placeholder="Native, Fluent, Conversational…" />
              </div>
            </EntryShell>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Interests" hint="Optional. A few personal interests.">
        <TagEditor
          items={value.interests}
          onChange={(next) => setValue((prev) => ({ ...prev, interests: next }))}
          placeholder="Add an interest and press Enter"
          ariaLabel="Add an interest"
        />
      </SectionCard>

      <SectionCard
        title="References"
        hint="Optional — many resumes simply state “Available on request”."
        addLabel="Add reference"
        onAdd={() => setValue((prev) => ({ ...prev, references: [...prev.references, emptyReference()] }))}
      >
        <div className="space-y-3">
          {value.references.length === 0 && (
            <p className="text-sm text-subtle">No references added — that&apos;s fine, they&apos;re optional.</p>
          )}
          {value.references.map((ref) => (
            <EntryShell key={ref.id} onRemove={() => removeFromList("references", ref.id)}>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Field label="Name" value={ref.name} onChange={(v) => updateList<ResumeReference>("references", ref.id, { name: v })} />
                <Field label="Title / relation" value={ref.title} onChange={(v) => updateList<ResumeReference>("references", ref.id, { title: v })} />
                <Field label="Contact" value={ref.contact} onChange={(v) => updateList<ResumeReference>("references", ref.id, { contact: v })} placeholder="email / phone" />
              </div>
            </EntryShell>
          ))}
        </div>
      </SectionCard>

      <p className={cn("px-1 text-xs text-subtle")}>Tip: drag to reorder sections from the preview panel.</p>
    </div>
  );
}
