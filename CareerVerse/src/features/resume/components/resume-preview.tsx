import type { ResumeData } from "@/types/resume";
import { cn } from "@/lib/utils";

function contactLine(contact: ResumeData["contact"]): string {
  return [contact.email, contact.phone, contact.location, contact.website, contact.linkedin]
    .map((v) => v.trim())
    .filter(Boolean)
    .join("  ·  ");
}

/**
 * ATS-friendly resume preview — single column, semantic text, no tables or
 * images, so applicant-tracking systems parse it cleanly. Two templates share
 * this structure and differ only in header/heading styling. This node carries
 * the `resume-print-area` class the export uses for print-to-PDF.
 */
export function ResumePreview({ resume }: { resume: ResumeData }) {
  const modern = resume.template === "modern";
  const name = resume.contact.fullName.trim() || "Your Name";

  const headingClass = cn(
    "mb-2 mt-5 text-[13px] font-bold uppercase tracking-wider",
    modern ? "text-[#2a78d6]" : "border-b border-neutral-300 pb-1 text-neutral-800",
  );

  return (
    <div className="resume-print-area mx-auto w-full max-w-[850px] rounded-lg border border-border bg-white p-8 text-[13px] leading-relaxed text-neutral-800 shadow-sm sm:p-10">
      {/* Header */}
      <header className={cn(modern ? "text-left" : "text-center")}>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{name}</h1>
        {resume.contact.headline.trim() && (
          <p className={cn("mt-0.5 text-sm font-medium", modern ? "text-[#2a78d6]" : "text-neutral-600")}>
            {resume.contact.headline}
          </p>
        )}
        {contactLine(resume.contact) && (
          <p className="mt-1.5 text-xs text-neutral-600">{contactLine(resume.contact)}</p>
        )}
      </header>

      {resume.summary.trim() && (
        <section>
          <h2 className={headingClass}>Summary</h2>
          <p className="text-neutral-700">{resume.summary}</p>
        </section>
      )}

      {resume.experience.length > 0 && (
        <section>
          <h2 className={headingClass}>Experience</h2>
          <div className="space-y-3">
            {resume.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <p className="font-semibold text-neutral-900">
                    {exp.role || "Role"}
                    {exp.company ? `, ${exp.company}` : ""}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {[exp.startDate, exp.current ? "Present" : exp.endDate]
                      .filter(Boolean)
                      .join(" – ")}
                  </p>
                </div>
                {exp.location.trim() && <p className="text-xs text-neutral-500">{exp.location}</p>}
                {exp.bullets.filter((b) => b.trim()).length > 0 && (
                  <ul className="mt-1 list-disc space-y-0.5 pl-4 text-neutral-700">
                    {exp.bullets
                      .filter((b) => b.trim())
                      .map((bullet, i) => (
                        <li key={i}>{bullet}</li>
                      ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.projects.length > 0 && (
        <section>
          <h2 className={headingClass}>Projects</h2>
          <div className="space-y-2">
            {resume.projects.map((project) => (
              <div key={project.id}>
                <p className="font-semibold text-neutral-900">{project.name || "Project"}</p>
                {project.description.trim() && (
                  <p className="text-neutral-700">{project.description}</p>
                )}
                {project.link.trim() && <p className="text-xs text-neutral-500">{project.link}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.education.length > 0 && (
        <section>
          <h2 className={headingClass}>Education</h2>
          <div className="space-y-2">
            {resume.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                  <p className="font-semibold text-neutral-900">
                    {edu.degree || "Degree"}
                    {edu.school ? `, ${edu.school}` : ""}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {[edu.startDate, edu.endDate].filter(Boolean).join(" – ")}
                  </p>
                </div>
                {edu.details.trim() && <p className="text-neutral-700">{edu.details}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {resume.skills.length > 0 && (
        <section>
          <h2 className={headingClass}>Skills</h2>
          <p className="text-neutral-700">{resume.skills.join("  ·  ")}</p>
        </section>
      )}

      {resume.certifications.length > 0 && (
        <section>
          <h2 className={headingClass}>Certifications</h2>
          <ul className="space-y-0.5 text-neutral-700">
            {resume.certifications.map((cert) => (
              <li key={cert.id}>
                {[cert.name, cert.issuer, cert.year].filter(Boolean).join(" — ")}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
