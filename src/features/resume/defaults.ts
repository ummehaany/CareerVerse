import type {
  ResumeCertification,
  ResumeContact,
  ResumeData,
  ResumeEducation,
  ResumeExperience,
  ResumeLanguage,
  ResumeProject,
  ResumeReference,
  ResumeTemplate,
} from "@/types/resume";

/** Reorderable resume sections (the header/contact block is always first). */
export const RESUME_SECTIONS = [
  { key: "summary", label: "Professional Summary" },
  { key: "experience", label: "Experience" },
  { key: "education", label: "Education" },
  { key: "projects", label: "Projects" },
  { key: "skills", label: "Skills" },
  { key: "certifications", label: "Certifications" },
  { key: "achievements", label: "Achievements" },
  { key: "languages", label: "Languages" },
  { key: "interests", label: "Interests" },
  { key: "references", label: "References" },
] as const;

export type ResumeSectionKey = (typeof RESUME_SECTIONS)[number]["key"];
export const DEFAULT_SECTION_ORDER: string[] = RESUME_SECTIONS.map((s) => s.key);
export const SECTION_LABELS: Record<string, string> = Object.fromEntries(
  RESUME_SECTIONS.map((s) => [s.key, s.label]),
);

export const TEMPLATES: Array<{ value: ResumeTemplate; label: string; hint: string }> = [
  { value: "classic", label: "Professional", hint: "Centered header, classic serif-free layout" },
  { value: "modern", label: "Modern", hint: "Left-aligned with an accent color" },
  { value: "minimal", label: "Minimal", hint: "Clean, understated, lots of whitespace" },
  { value: "creative", label: "Creative", hint: "Accent header band with photo" },
];

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
}

export function emptyContact(): ResumeContact {
  return {
    fullName: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    website: "",
    linkedin: "",
    github: "",
    photo: "",
  };
}

export function emptyExperience(): ResumeExperience {
  return { id: newId(), role: "", company: "", location: "", startDate: "", endDate: "", current: false, bullets: [] };
}
export function emptyEducation(): ResumeEducation {
  return { id: newId(), degree: "", school: "", location: "", startDate: "", endDate: "", details: "" };
}
export function emptyProject(): ResumeProject {
  return { id: newId(), name: "", description: "", link: "" };
}
export function emptyCertification(): ResumeCertification {
  return { id: newId(), name: "", issuer: "", year: "" };
}
export function emptyLanguage(): ResumeLanguage {
  return { id: newId(), name: "", level: "" };
}
export function emptyReference(): ResumeReference {
  return { id: newId(), name: "", title: "", contact: "" };
}

/** A blank resume with all fields present (used for new users). */
export function emptyResume(): ResumeData {
  return {
    template: "classic",
    contact: emptyContact(),
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    interests: [],
    references: [],
    sectionOrder: [...DEFAULT_SECTION_ORDER],
  };
}

/** Ensure a (possibly older/partial) record has every field — safe to render + save. */
export function normalizeResume(input: Partial<ResumeData> | null | undefined): ResumeData {
  const base = emptyResume();
  if (!input) return base;
  const contact = { ...base.contact, ...(input.contact ?? {}) };
  const order = Array.isArray(input.sectionOrder) && input.sectionOrder.length ? input.sectionOrder : base.sectionOrder;
  // Append any known sections missing from a stored order (forward-compat).
  const merged = [...order, ...DEFAULT_SECTION_ORDER.filter((k) => !order.includes(k))];
  return {
    template: input.template ?? base.template,
    contact,
    summary: input.summary ?? "",
    experience: input.experience ?? [],
    education: input.education ?? [],
    skills: input.skills ?? [],
    projects: input.projects ?? [],
    certifications: input.certifications ?? [],
    achievements: input.achievements ?? [],
    languages: input.languages ?? [],
    interests: input.interests ?? [],
    references: input.references ?? [],
    sectionOrder: merged,
  };
}
