import type { Career, DemandLevel } from "@/lib/careers/types";
import { getIndiaSalaryLpa } from "@/lib/careers/salary-india";

/*
 * Pure, deterministic filtering + derivation logic for the Career Explorer.
 * No React, no side effects — trivially unit-testable and easy to swap for a
 * backend/API later (the shapes here map cleanly to query params).
 */

export const EDUCATION_LEVELS = [
  "Diploma / Bootcamp",
  "Bachelor's",
  "Master's / MBA",
  "Doctoral / Professional",
] as const;
export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const WORK_STYLES = ["Remote", "Hybrid", "On-site"] as const;
export type WorkStyle = (typeof WORK_STYLES)[number];

export const EXPERIENCE_LEVELS = ["Entry Level", "Mid Level", "Senior / Expert"] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const DEMAND_LEVELS: DemandLevel[] = ["Very High", "High", "Growing", "Steady", "Stable"];

export interface SalaryBucket {
  key: string;
  label: string;
  lo: number;
  hi: number;
}
export const SALARY_BUCKETS: SalaryBucket[] = [
  { key: "under6", label: "Under ₹6 LPA", lo: 0, hi: 6 },
  { key: "6-15", label: "₹6–15 LPA", lo: 6, hi: 15 },
  { key: "15-30", label: "₹15–30 LPA", lo: 15, hi: 30 },
  { key: "30plus", label: "₹30 LPA+", lo: 30, hi: Number.POSITIVE_INFINITY },
];

export interface CareerFilters {
  education: string;
  salary: string;
  demand: string;
  workStyle: string;
  experience: string;
}

export const EMPTY_FILTERS: CareerFilters = {
  education: "all",
  salary: "all",
  demand: "all",
  workStyle: "all",
  experience: "all",
};

export function activeFilterCount(f: CareerFilters): number {
  return Object.values(f).filter((v) => v !== "all").length;
}

// ── Derivations from the base catalog fields ────────────────────────────────

export function educationLevel(career: Career): EducationLevel {
  const e = career.education.toLowerCase();
  if (/phd|doctor|mbbs|md\b|dds|dvm|residency|d\.phil/.test(e)) return "Doctoral / Professional";
  if (/\bca\b|cfa|cpa|actuar|bar exam|llb|chartered|icai|acca/.test(e)) return "Doctoral / Professional";
  if (/master|mba|m\.?s\.?\b|m\.?tech|postgrad|pg\b/.test(e)) return "Master's / MBA";
  if (/diploma|bootcamp|self-taught|certificat|vocational|no formal|apprentic/.test(e))
    return "Diploma / Bootcamp";
  if (/bachelor|b\.?tech|b\.?e\.?\b|degree|graduate/.test(e)) return "Bachelor's";
  return "Bachelor's";
}

const WORK_STYLE_BY_CATEGORY: Record<string, WorkStyle[]> = {
  Technology: ["Remote", "Hybrid", "On-site"],
  "Data & AI": ["Remote", "Hybrid", "On-site"],
  Design: ["Remote", "Hybrid", "On-site"],
  "Marketing & Media": ["Remote", "Hybrid", "On-site"],
  "Product & Management": ["Remote", "Hybrid", "On-site"],
  Business: ["Hybrid", "On-site"],
  Finance: ["Hybrid", "On-site"],
  Engineering: ["Hybrid", "On-site"],
  Science: ["Hybrid", "On-site"],
  "Law & Public": ["Hybrid", "On-site"],
  Education: ["Hybrid", "On-site"],
  "Architecture & Built": ["Hybrid", "On-site"],
  Healthcare: ["On-site"],
  "Aviation & Transport": ["On-site"],
  Hospitality: ["On-site"],
};

export function workStylesFor(career: Career): WorkStyle[] {
  return WORK_STYLE_BY_CATEGORY[career.category] ?? ["Hybrid", "On-site"];
}

/** Primary work style shown on the card. */
export function primaryWorkStyle(career: Career): WorkStyle {
  return workStylesFor(career)[0] ?? "Hybrid";
}

export function experienceLevel(career: Career): ExperienceLevel {
  if (career.difficulty <= 2) return "Entry Level";
  if (career.difficulty === 3) return "Mid Level";
  return "Senior / Expert";
}

/** Rough time-to-job-ready estimate in months, from barrier to entry. */
export function estLearningMonths(career: Career): number {
  return Math.min(24, 3 + career.difficulty * 3);
}

// ── Matching ────────────────────────────────────────────────────────────────

function norm(s: string): string {
  return s.toLowerCase();
}

/** Full-text match across name, skills, industry (category), and description. */
export function matchesQuery(career: Career, q: string): boolean {
  if (!q) return true;
  const haystack = norm(
    `${career.title} ${career.tagline} ${career.category} ${career.whatDoes} ${career.education} ${career.skills.join(" ")} ${career.companies.join(" ")}`,
  );
  return q
    .split(/\s+/)
    .filter(Boolean)
    .every((term) => haystack.includes(term));
}

export function salaryMatches(career: Career, bucketKey: string): boolean {
  if (bucketKey === "all") return true;
  const bucket = SALARY_BUCKETS.find((b) => b.key === bucketKey);
  if (!bucket) return true;
  const { minLpa, maxLpa } = getIndiaSalaryLpa(career.slug, career.salary);
  return maxLpa >= bucket.lo && minLpa <= bucket.hi;
}

export function matchesFilters(career: Career, f: CareerFilters): boolean {
  if (f.education !== "all" && educationLevel(career) !== f.education) return false;
  if (f.demand !== "all" && career.demand !== f.demand) return false;
  if (f.experience !== "all" && experienceLevel(career) !== f.experience) return false;
  if (f.workStyle !== "all" && !workStylesFor(career).includes(f.workStyle as WorkStyle)) return false;
  if (!salaryMatches(career, f.salary)) return false;
  return true;
}

// ── Curated topics (premium category chips) ─────────────────────────────────

export interface Topic {
  key: string;
  label: string;
  match: (c: Career) => boolean;
}

const kw = (c: Career, re: RegExp) => re.test(`${c.slug} ${c.title} ${c.whatDoes}`.toLowerCase());

export const TOPICS: Topic[] = [
  { key: "software", label: "Software Engineering", match: (c) => c.category === "Technology" && !kw(c, /data|security|cyber/) },
  { key: "ai", label: "Artificial Intelligence", match: (c) => kw(c, /\bai\b|a\.i|machine learning|\bml\b|nlp|computer vision|deep learning/) },
  { key: "data", label: "Data Science", match: (c) => c.category === "Data & AI" || kw(c, /data scien|data analyst|data engineer|analytics/) },
  { key: "cyber", label: "Cybersecurity", match: (c) => kw(c, /security|cyber/) },
  { key: "design", label: "UI/UX Design", match: (c) => c.category === "Design" },
  { key: "product", label: "Product Management", match: (c) => c.category === "Product & Management" },
  { key: "marketing", label: "Marketing", match: (c) => c.category === "Marketing & Media" },
  { key: "finance", label: "Finance", match: (c) => c.category === "Finance" },
  { key: "healthcare", label: "Healthcare", match: (c) => c.category === "Healthcare" },
  { key: "law", label: "Law", match: (c) => c.category === "Law & Public" && kw(c, /law|legal|advocate|judge|paralegal/) },
  { key: "government", label: "Government", match: (c) => kw(c, /civil service|policy|government|public sector|ias|administrative/) },
  { key: "entrepreneurship", label: "Entrepreneurship", match: (c) => kw(c, /entrepreneur|founder|startup|venture/) },
  { key: "creative", label: "Creative Arts", match: (c) => kw(c, /illustrat|animat|photograph|graphic|motion|interior|content creator|artist/) },
  { key: "aviation", label: "Aviation", match: (c) => c.category === "Aviation & Transport" },
  { key: "research", label: "Research", match: (c) => c.category === "Science" || kw(c, /research|scientist/) },
  { key: "education", label: "Education", match: (c) => c.category === "Education" },
  { key: "sports", label: "Sports", match: (c) => kw(c, /sport|athlete|fitness|coach\b/) },
  { key: "hospitality", label: "Hospitality", match: (c) => c.category === "Hospitality" || kw(c, /chef|hotel|hospitality|culinary/) },
];

export function topicMatches(career: Career, topicKey: string): boolean {
  if (topicKey === "all") return true;
  const topic = TOPICS.find((t) => t.key === topicKey);
  return topic ? topic.match(career) : true;
}

/** Topics that actually have careers, with counts — used to render chips. */
export function topicsWithCounts(careers: Career[]): { topic: Topic; count: number }[] {
  return TOPICS.map((topic) => ({
    topic,
    count: careers.filter((c) => topic.match(c)).length,
  })).filter((t) => t.count > 0);
}
