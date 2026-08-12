import type { ReactNode } from "react";
import type { ResumeData, ResumeTemplate } from "@/types/resume";
import { cn } from "@/lib/utils";

const ACCENT: Record<ResumeTemplate, string> = {
  classic: "#1f2937",
  modern: "#2a78d6",
  minimal: "#374151",
  creative: "#7c3aed",
};

const SECTION_TITLE: Record<string, string> = {
  summary: "Summary",
  experience: "Experience",
  education: "Education",
  projects: "Projects",
  skills: "Skills",
  certifications: "Certifications",
  achievements: "Achievements",
  languages: "Languages",
  interests: "Interests",
  references: "References",
};

function contactLinks(contact: ResumeData["contact"]): string {
  return [contact.email, contact.phone, contact.location, contact.website, contact.linkedin, contact.github]
    .map((v) => v.trim())
    .filter(Boolean)
    .join("  ·  ");
}

function headingClassFor(template: ResumeTemplate, accent: string) {
  const base = "mb-2 mt-5 first:mt-0";
  switch (template) {
    case "modern":
      return { className: cn(base, "text-[13px] font-bold uppercase tracking-wider"), style: { color: accent } };
    case "minimal":
      return { className: cn(base, "text-[11px] font-semibold uppercase tracking-[0.2em] text-neutral-500"), style: undefined };
    case "creative":
      return { className: cn(base, "text-[13px] font-bold uppercase tracking-wider"), style: { color: accent } };
    case "classic":
    default:
      return {
        className: cn(base, "border-b border-neutral-300 pb-1 text-[13px] font-bold uppercase tracking-wider text-neutral-800"),
        style: undefined,
      };
  }
}

/**
 * ATS-friendly resume preview. Single column, semantic text, no tables — so
 * applicant-tracking systems parse it cleanly. Four templates differ in header
 * and heading styling only. Sections render in `resume.sectionOrder`. Carries
 * the `resume-print-area` class used by print-to-PDF.
 */
export function ResumePreview({ resume }: { resume: ResumeData }) {
  const template = resume.template;
  const accent = ACCENT[template];
  const heading = headingClassFor(template, accent);
  const name = resume.contact.fullName.trim() || "Your Name";
  const c = resume.contact;
  const showPhoto = (template === "modern" || template === "creative") && Boolean(c.photo);

  const Heading = ({ children }: { children: ReactNode }) => (
    <h2 className={heading.className} style={heading.style}>
      {children}
    </h2>
  );

  const photo = showPhoto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={c.photo} alt="" className="h-16 w-16 shrink-0 rounded-full object-cover" />
  ) : null;

  function header(): ReactNode {
    const title = c.headline.trim();
    const links = contactLinks(c);
    if (template === "creative") {
      return (
        <header className="mb-2 flex items-center gap-4 rounded-lg border-l-4 p-4" style={{ borderColor: accent, backgroundColor: `${accent}0f` }}>
          {photo}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{name}</h1>
            {title && <p className="text-sm font-medium" style={{ color: accent }}>{title}</p>}
            {links && <p className="mt-1 text-xs text-neutral-600">{links}</p>}
          </div>
        </header>
      );
    }
    if (template === "modern") {
      return (
        <header className="flex items-center gap-4">
          {photo}
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{name}</h1>
            {title && <p className="text-sm font-medium" style={{ color: accent }}>{title}</p>}
            {links && <p className="mt-1 text-xs text-neutral-600">{links}</p>}
          </div>
        </header>
      );
    }
    // classic (centered) and minimal (left)
    return (
      <header className={cn(template === "classic" ? "text-center" : "text-left")}>
        <h1 className={cn("font-bold tracking-tight text-neutral-900", template === "minimal" ? "text-xl" : "text-2xl")}>{name}</h1>
        {title && <p className="mt-0.5 text-sm font-medium text-neutral-600">{title}</p>}
        {links && <p className="mt-1.5 text-xs text-neutral-600">{links}</p>}
      </header>
    );
  }

  function renderSection(key: string): ReactNode {
    const title = SECTION_TITLE[key];
    if (!title) return null;
    switch (key) {
      case "summary":
        return resume.summary.trim() ? (
          <section key={key}>
            <Heading>{title}</Heading>
            <p className="text-neutral-700">{resume.summary}</p>
          </section>
        ) : null;

      case "experience":
        return resume.experience.length > 0 ? (
          <section key={key}>
            <Heading>{title}</Heading>
            <div className="space-y-3">
              {resume.experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <p className="font-semibold text-neutral-900">
                      {exp.role || "Role"}
                      {exp.company ? `, ${exp.company}` : ""}
                    </p>
                    <p className="text-xs text-neutral-500">
                      {[exp.startDate, exp.current ? "Present" : exp.endDate].filter(Boolean).join(" – ")}
                    </p>
                  </div>
                  {exp.location.trim() && <p className="text-xs text-neutral-500">{exp.location}</p>}
                  {exp.bullets.filter((b) => b.trim()).length > 0 && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-neutral-700">
                      {exp.bullets.filter((b) => b.trim()).map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case "education":
        return resume.education.length > 0 ? (
          <section key={key}>
            <Heading>{title}</Heading>
            <div className="space-y-2">
              {resume.education.map((edu) => (
                <div key={edu.id}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                    <p className="font-semibold text-neutral-900">
                      {edu.degree || "Degree"}
                      {edu.school ? `, ${edu.school}` : ""}
                    </p>
                    <p className="text-xs text-neutral-500">{[edu.startDate, edu.endDate].filter(Boolean).join(" – ")}</p>
                  </div>
                  {edu.details.trim() && <p className="text-neutral-700">{edu.details}</p>}
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case "projects":
        return resume.projects.length > 0 ? (
          <section key={key}>
            <Heading>{title}</Heading>
            <div className="space-y-2">
              {resume.projects.map((project) => (
                <div key={project.id}>
                  <p className="font-semibold text-neutral-900">{project.name || "Project"}</p>
                  {project.description.trim() && <p className="text-neutral-700">{project.description}</p>}
                  {project.link.trim() && <p className="text-xs text-neutral-500">{project.link}</p>}
                </div>
              ))}
            </div>
          </section>
        ) : null;

      case "skills":
        return resume.skills.length > 0 ? (
          <section key={key}>
            <Heading>{title}</Heading>
            <p className="text-neutral-700">{resume.skills.join("  ·  ")}</p>
          </section>
        ) : null;

      case "certifications":
        return resume.certifications.length > 0 ? (
          <section key={key}>
            <Heading>{title}</Heading>
            <ul className="space-y-0.5 text-neutral-700">
              {resume.certifications.map((cert) => (
                <li key={cert.id}>{[cert.name, cert.issuer, cert.year].filter(Boolean).join(" — ")}</li>
              ))}
            </ul>
          </section>
        ) : null;

      case "achievements":
        return resume.achievements.length > 0 ? (
          <section key={key}>
            <Heading>{title}</Heading>
            <ul className="list-disc space-y-0.5 pl-4 text-neutral-700">
              {resume.achievements.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </section>
        ) : null;

      case "languages":
        return resume.languages.length > 0 ? (
          <section key={key}>
            <Heading>{title}</Heading>
            <p className="text-neutral-700">
              {resume.languages.map((l) => [l.name, l.level].filter(Boolean).join(" (") + (l.level ? ")" : "")).join("  ·  ")}
            </p>
          </section>
        ) : null;

      case "interests":
        return resume.interests.length > 0 ? (
          <section key={key}>
            <Heading>{title}</Heading>
            <p className="text-neutral-700">{resume.interests.join("  ·  ")}</p>
          </section>
        ) : null;

      case "references":
        return resume.references.length > 0 ? (
          <section key={key}>
            <Heading>{title}</Heading>
            <ul className="space-y-0.5 text-neutral-700">
              {resume.references.map((ref) => (
                <li key={ref.id}>{[ref.name, ref.title, ref.contact].filter(Boolean).join(" — ")}</li>
              ))}
            </ul>
          </section>
        ) : null;

      default:
        return null;
    }
  }

  return (
    <div className="resume-print-area mx-auto w-full max-w-[850px] rounded-lg border border-border bg-white p-8 text-[13px] leading-relaxed text-neutral-800 shadow-sm sm:p-10">
      {header()}
      {resume.sectionOrder.map((key) => renderSection(key))}
    </div>
  );
}
