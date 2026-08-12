import type { ResumeData } from "@/types/resume";

/*
 * Deterministic, offline ATS scorer. Produces a 0–100 score from five weighted
 * dimensions plus concrete suggestions. No AI required — always available, and
 * the shape maps cleanly onto a future server-side scorer.
 */

export interface AtsDimension {
  key: string;
  label: string;
  score: number; // 0–100
  weight: number; // relative
}

export interface AtsResult {
  score: number;
  dimensions: AtsDimension[];
  suggestions: string[];
}

const ACTION_VERBS = [
  "led", "built", "designed", "developed", "improved", "launched", "created", "managed",
  "increased", "reduced", "delivered", "implemented", "drove", "owned", "shipped", "optimized",
  "automated", "architected", "mentored", "scaled", "spearheaded", "streamlined", "achieved",
];

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function hasNumber(text: string): boolean {
  return /\d/.test(text);
}

function allBullets(resume: ResumeData): string[] {
  return resume.experience.flatMap((e) => e.bullets.map((b) => b.trim()).filter(Boolean));
}

export function computeAtsScore(resume: ResumeData): AtsResult {
  const c = resume.contact;
  const bullets = allBullets(resume);
  const summaryLen = resume.summary.trim().length;

  // Completeness — are the essential blocks present?
  const completenessChecks = [
    Boolean(c.fullName.trim()),
    Boolean(c.email.trim()),
    Boolean(c.phone.trim()),
    Boolean(c.location.trim()),
    Boolean(c.headline.trim()),
    summaryLen > 0,
    resume.experience.length > 0,
    resume.education.length > 0,
    resume.skills.length > 0,
  ];
  const completeness = (completenessChecks.filter(Boolean).length / completenessChecks.length) * 100;

  // Keywords — strong action verbs and quantified impact in bullets.
  const strongBullets = bullets.filter((b) => {
    const first = b.toLowerCase().split(/\s+/)[0] ?? "";
    return ACTION_VERBS.includes(first);
  }).length;
  const quantified = bullets.filter(hasNumber).length;
  const keywords = bullets.length
    ? clamp((strongBullets / bullets.length) * 60 + (quantified / bullets.length) * 40)
    : 0;

  // Formatting — links, dated roles, bullets present.
  const formattingChecks = [
    Boolean(c.linkedin.trim() || c.github.trim() || c.website.trim()),
    resume.experience.every((e) => Boolean(e.startDate.trim())),
    bullets.length > 0,
    resume.experience.every((e) => Boolean(e.role.trim() && e.company.trim())),
    resume.sectionOrder.length > 0,
  ];
  const formatting = (formattingChecks.filter(Boolean).length / formattingChecks.length) * 100;

  // Readability — summary length and bullet length in a healthy range.
  const summaryOk = summaryLen >= 150 && summaryLen <= 600 ? 100 : summaryLen === 0 ? 0 : 60;
  const longBullets = bullets.filter((b) => b.length > 220).length;
  const bulletReadability = bullets.length ? clamp(100 - (longBullets / bullets.length) * 100) : 60;
  const readability = clamp(summaryOk * 0.5 + bulletReadability * 0.5);

  // Skill coverage — aim for ~10 relevant skills.
  const skillCoverage = clamp((resume.skills.length / 10) * 100);

  const dimensions: AtsDimension[] = [
    { key: "completeness", label: "Completeness", score: clamp(completeness), weight: 0.25 },
    { key: "keywords", label: "Keywords & impact", score: keywords, weight: 0.2 },
    { key: "formatting", label: "Formatting", score: clamp(formatting), weight: 0.2 },
    { key: "readability", label: "Readability", score: readability, weight: 0.15 },
    { key: "skills", label: "Skill coverage", score: skillCoverage, weight: 0.2 },
  ];

  const score = clamp(dimensions.reduce((sum, d) => sum + d.score * d.weight, 0));

  const suggestions: string[] = [];
  if (!c.fullName.trim() || !c.email.trim() || !c.phone.trim())
    suggestions.push("Add your full name, email, and phone so recruiters can reach you.");
  if (!c.headline.trim()) suggestions.push("Add a professional title (e.g. “Frontend Engineer”).");
  if (summaryLen === 0) suggestions.push("Write a 2–3 sentence professional summary — try the AI generator.");
  else if (summaryLen < 150) suggestions.push("Expand your summary to 2–3 full sentences.");
  if (resume.skills.length < 8)
    suggestions.push(`Add ${8 - resume.skills.length}+ more relevant skills to improve keyword coverage.`);
  if (bullets.length > 0 && strongBullets / bullets.length < 0.6)
    suggestions.push("Start more bullet points with strong action verbs (Led, Built, Improved…).");
  if (bullets.length > 0 && quantified / bullets.length < 0.4)
    suggestions.push("Quantify impact with numbers (%, ₹, users, time saved) in more bullets.");
  if (resume.experience.length === 0) suggestions.push("Add at least one work experience entry.");
  if (resume.education.length === 0) suggestions.push("Add your education.");
  if (!c.linkedin.trim() && !c.github.trim() && !c.website.trim())
    suggestions.push("Add a LinkedIn, GitHub, or portfolio link.");

  return { score, dimensions, suggestions };
}
