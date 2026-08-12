import { getCareers } from "@/lib/careers/catalog";
import type { Career } from "@/lib/careers/types";
import type { PlanSeed } from "@/lib/ai/prompts/career-plan";
import type { CoachContext } from "./types";

/*
 * Goal → career resolver for the Career Planning Engine. Turns a free-text goal
 * ("I want to become a Data Scientist") into a catalog match so plans are seeded
 * with real CareerVerse data first, then enhanced by AI.
 */

/** Popular starting points shown as one-tap goals. */
export const SUGGESTED_GOALS = [
  "Data Scientist",
  "AI Engineer",
  "Product Manager",
  "Cybersecurity Engineer",
  "Software Engineer",
  "UX Designer",
  "Data Analyst",
  "Cloud Engineer",
];

const FILLERS = [
  /^\s*i\s+want\s+to\s+become\s+(an?\s+)?/i,
  /^\s*i\s+want\s+to\s+be\s+(an?\s+)?/i,
  /^\s*i\s+wanna\s+be\s+(an?\s+)?/i,
  /^\s*how\s+(do\s+i|to)\s+become\s+(an?\s+)?/i,
  /^\s*how\s+to\s+be\s+(an?\s+)?/i,
  /^\s*become\s+(an?\s+)?/i,
  /^\s*career\s+(as\s+)?(an?\s+)?/i,
  /^\s*i\s+want\s+(an?\s+)?/i,
];

/** Strip conversational filler and punctuation to isolate the career phrase. */
export function parseGoal(input: string): string {
  let s = input.trim();
  for (const re of FILLERS) s = s.replace(re, "");
  s = s.replace(/[?.!]+$/g, "").replace(/\s+/g, " ").trim();
  // Title-case-ish cleanup for display when short.
  return s;
}

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((t) => t.length > 1 && !["a", "an", "the", "of", "and", "engineer", "developer"].includes(t)),
  );
}

/** Best-effort match of a cleaned goal to the careers catalog. */
export function resolveCareer(cleaned: string): Career | null {
  const careers = getCareers();
  const q = cleaned.toLowerCase().trim();
  if (!q) return null;

  // 1) exact / substring title match
  for (const c of careers) {
    const t = c.title.toLowerCase();
    if (t === q || t.includes(q) || q.includes(t)) return c;
  }

  // 2) token overlap (Jaccard-ish)
  const qt = tokens(q);
  if (qt.size === 0) return null;
  let best: { c: Career; score: number } | null = null;
  for (const c of careers) {
    const ct = tokens(c.title);
    if (ct.size === 0) continue;
    let inter = 0;
    for (const t of qt) if (ct.has(t)) inter += 1;
    const score = inter / Math.max(1, Math.min(qt.size, ct.size));
    if (score >= 0.5 && (!best || score > best.score)) best = { c, score };
  }
  return best?.c ?? null;
}

/** Assemble the AI/fallback seed from the matched career + the user's context. */
export function buildPlanSeed(cleaned: string, career: Career | null, context: CoachContext): PlanSeed {
  return {
    careerTitle: career?.title ?? (cleaned || "Your target career"),
    category: career?.category,
    catalogSkills: career?.skills,
    catalogCertifications: career?.certifications?.filter((c) => c && c !== "—"),
    topCompanies: career?.companies,
    salaryUsd: career ? { min: career.salary.min, max: career.salary.max } : undefined,
    userStrengths: context.strongSkills?.slice(0, 8),
    userGaps: context.missingSkills?.slice(0, 8),
    hasRoadmap: Boolean(context.roadmap),
    roadmapTitle: context.roadmap?.title,
  };
}
