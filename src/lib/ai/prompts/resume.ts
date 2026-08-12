import type { ResumeData } from "@/types/resume";

export const RESUME_SYSTEM =
  "You are an expert technical resume writer and ATS (applicant tracking system) optimization specialist. " +
  "You write concise, impact-focused, keyword-rich content. You never invent employers, dates, or facts — " +
  "you only improve and reframe what the user provides. Prefer strong action verbs and quantified results.";

export function resumeContext(r: ResumeData): string {
  const roles = r.experience
    .map((e) => `${e.role || "Role"}${e.company ? ` at ${e.company}` : ""}`)
    .filter(Boolean)
    .join("; ");
  return [
    r.contact.headline ? `Target title: ${r.contact.headline}` : "",
    r.skills.length ? `Skills: ${r.skills.join(", ")}` : "",
    roles ? `Experience: ${roles}` : "",
    r.education[0]?.degree ? `Education: ${r.education[0].degree}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildSummaryPrompt(r: ResumeData): string {
  return (
    "Write a professional resume summary (2–3 sentences, first-person implied, no pronoun 'I', no heading) " +
    "for this candidate. Make it confident, specific, and ATS-friendly.\n\n" +
    resumeContext(r)
  );
}

export function buildImproveBulletsPrompt(role: string, bullets: string[]): string {
  return (
    `Improve these resume bullet points for the role "${role || "this role"}". ` +
    "Return one improved bullet per line, no numbering or dashes. Start each with a strong action verb, " +
    "keep each under 30 words, and quantify impact where plausible without inventing specific numbers.\n\n" +
    bullets.map((b) => `- ${b}`).join("\n")
  );
}

export function buildSuggestSkillsPrompt(r: ResumeData): string {
  return (
    "Suggest 8 additional relevant, ATS-valuable skills for this candidate that are NOT already listed. " +
    "Return a plain comma-separated list, no explanations.\n\n" +
    resumeContext(r) +
    `\nAlready listed: ${r.skills.join(", ") || "(none)"}`
  );
}

export function buildImproveTextPrompt(text: string): string {
  return (
    "Rewrite the following resume text to be clearer, more professional, grammatically correct, and ATS-friendly. " +
    "Keep it roughly the same length and return only the rewritten text.\n\n" +
    text
  );
}

export function buildAtsPrompt(r: ResumeData): string {
  return (
    "Give 5 short, specific, actionable recommendations to make this resume more ATS-friendly and stronger. " +
    "Return one recommendation per line, no numbering.\n\n" +
    resumeContext(r) +
    `\nSummary present: ${r.summary.trim() ? "yes" : "no"}. Experience entries: ${r.experience.length}. Skills: ${r.skills.length}.`
  );
}
