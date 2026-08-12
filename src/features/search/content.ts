import { getCareers } from "@/lib/careers/catalog";
import { getCompanyRecords } from "@/lib/companies/catalog";
import { ROLE_LIBRARY } from "@/lib/companies/roles";
import { ROUTES } from "@/config/routes";

/*
 * Global-search content index.
 *
 * The redesigned search covers meaningful career CONTENT — never navigation
 * items. Entries are derived from the careers, roles, and companies catalogs
 * plus curated reference lists, and grouped for an intelligent, premium result
 * experience. Everything is static/derived so search is instant (no network).
 */

export type SearchGroup =
  | "Careers"
  | "Job Roles"
  | "Skills"
  | "Programming Languages"
  | "Certifications"
  | "Target Companies"
  | "Roadmaps"
  | "Resume Sections"
  | "Interview Topics"
  | "Learning Resources";

export interface SearchItem {
  id: string;
  group: SearchGroup;
  title: string;
  subtitle: string;
  href: string;
  icon: string;
  /** Lowercase haystack for matching. */
  hay: string;
}

/** Stable display + keyboard order for groups. */
export const GROUP_ORDER: SearchGroup[] = [
  "Careers",
  "Job Roles",
  "Target Companies",
  "Skills",
  "Programming Languages",
  "Certifications",
  "Roadmaps",
  "Interview Topics",
  "Resume Sections",
  "Learning Resources",
];

export const GROUP_ICON: Record<SearchGroup, string> = {
  Careers: "compass",
  "Job Roles": "target",
  Skills: "puzzle",
  "Programming Languages": "code",
  Certifications: "award",
  "Target Companies": "rocket",
  Roadmaps: "route",
  "Resume Sections": "file",
  "Interview Topics": "mic",
  "Learning Resources": "book",
};

const PROGRAMMING_LANGUAGES = [
  "Python", "JavaScript", "TypeScript", "Java", "C++", "C#", "C", "Go", "Rust",
  "Swift", "Kotlin", "SQL", "Ruby", "PHP", "R", "Scala", "Dart", "Solidity", "MATLAB", "Bash",
];

const RESUME_SECTIONS = [
  "Professional Summary", "Work Experience", "Education", "Skills",
  "Projects", "Certifications", "Achievements", "Contact Information",
];

const LEARNING_RESOURCES = [
  "Coursera", "Udemy", "freeCodeCamp", "edX", "LeetCode", "Khan Academy",
  "YouTube", "Pluralsight", "DataCamp", "Codecademy", "MDN Web Docs", "HackerRank",
];

const ROADMAPS = [
  "Frontend Developer Roadmap", "Backend Developer Roadmap", "Full-Stack Roadmap",
  "Data Scientist Roadmap", "Machine Learning Roadmap", "DevOps Roadmap",
  "AI Engineer Roadmap", "Cloud Engineer Roadmap", "UX Designer Roadmap",
  "Product Manager Roadmap", "Cybersecurity Roadmap",
];

const CORE_INTERVIEW_TOPICS = [
  "Data Structures & Algorithms", "System Design", "Behavioral", "SQL",
  "Object-Oriented Design", "Coding Challenge", "Case Study", "Aptitude",
];

/** Programming languages get their own group; keep them out of "Skills". */
const LANG_SET = new Set(PROGRAMMING_LANGUAGES.map((l) => l.toLowerCase()));

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

let INDEX: SearchItem[] | null = null;

/** Build (and memoize) the full content index. */
export function buildSearchIndex(): SearchItem[] {
  if (INDEX) return INDEX;

  const items: SearchItem[] = [];
  const careers = getCareers();
  const companies = getCompanyRecords();
  const roles = Object.values(ROLE_LIBRARY);

  // Map career title → slug for linking roles to a matching career.
  const careerByTitle = new Map<string, string>();
  for (const c of careers) careerByTitle.set(c.title.toLowerCase(), c.slug);

  // Careers
  for (const c of careers) {
    items.push({
      id: `career:${c.slug}`,
      group: "Careers",
      title: c.title,
      subtitle: c.category,
      href: `${ROUTES.careers}/${c.slug}`,
      icon: GROUP_ICON.Careers,
      hay: `${c.title} ${c.category} ${c.tagline} ${c.skills.join(" ")}`.toLowerCase(),
    });
  }

  // Job Roles (from the role library)
  for (const r of roles) {
    const match = careerByTitle.get(r.title.toLowerCase());
    items.push({
      id: `role:${r.key}`,
      group: "Job Roles",
      title: r.title,
      subtitle: r.family,
      href: match ? `${ROUTES.careers}/${match}` : ROUTES.careers,
      icon: GROUP_ICON["Job Roles"],
      hay: `${r.title} ${r.family} ${r.requiredSkills.join(" ")}`.toLowerCase(),
    });
  }

  // Target Companies
  for (const c of companies) {
    items.push({
      id: `company:${c.slug}`,
      group: "Target Companies",
      title: c.name,
      subtitle: c.industry,
      href: `${ROUTES.companies}/${c.slug}`,
      icon: GROUP_ICON["Target Companies"],
      hay: `${c.name} ${c.industry} ${c.category} ${c.tagline}`.toLowerCase(),
    });
  }

  // Skills + Certifications (deduped across careers & roles)
  const skillSet = new Map<string, string>();
  const certSet = new Map<string, string>();
  const topicSet = new Map<string, string>();
  for (const c of careers) {
    for (const s of c.skills) skillSet.set(s.toLowerCase(), s);
    for (const cert of c.certifications) if (cert && cert !== "—") certSet.set(cert.toLowerCase(), cert);
  }
  for (const r of roles) {
    for (const s of [...r.requiredSkills, ...r.preferredSkills]) skillSet.set(s.toLowerCase(), s);
    for (const cert of r.certifications) if (cert && cert !== "—") certSet.set(cert.toLowerCase(), cert);
    for (const t of r.interviewTopics) topicSet.set(t.toLowerCase(), t);
  }
  for (const c of companies) for (const t of c.interviewFocus) topicSet.set(t.toLowerCase(), t);
  for (const t of CORE_INTERVIEW_TOPICS) topicSet.set(t.toLowerCase(), t);

  for (const [key, label] of skillSet) {
    if (LANG_SET.has(key)) continue; // languages have their own group
    items.push({
      id: `skill:${slugify(label)}`,
      group: "Skills",
      title: label,
      subtitle: "Skill",
      href: ROUTES.skillGap,
      icon: GROUP_ICON.Skills,
      hay: `${label} skill`.toLowerCase(),
    });
  }

  for (const lang of PROGRAMMING_LANGUAGES) {
    items.push({
      id: `lang:${slugify(lang)}`,
      group: "Programming Languages",
      title: lang,
      subtitle: "Programming language",
      href: ROUTES.skillGap,
      icon: GROUP_ICON["Programming Languages"],
      hay: `${lang} programming language code`.toLowerCase(),
    });
  }

  for (const [, label] of certSet) {
    items.push({
      id: `cert:${slugify(label)}`,
      group: "Certifications",
      title: label,
      subtitle: "Certification",
      href: ROUTES.learning,
      icon: GROUP_ICON.Certifications,
      hay: `${label} certification cert`.toLowerCase(),
    });
  }

  for (const [, label] of topicSet) {
    items.push({
      id: `topic:${slugify(label)}`,
      group: "Interview Topics",
      title: label,
      subtitle: "Interview topic",
      href: ROUTES.interviews,
      icon: GROUP_ICON["Interview Topics"],
      hay: `${label} interview topic`.toLowerCase(),
    });
  }

  for (const rm of ROADMAPS) {
    items.push({
      id: `roadmap:${slugify(rm)}`,
      group: "Roadmaps",
      title: rm,
      subtitle: "Learning roadmap",
      href: ROUTES.roadmap,
      icon: GROUP_ICON.Roadmaps,
      hay: `${rm} roadmap learning path`.toLowerCase(),
    });
  }

  for (const rs of RESUME_SECTIONS) {
    items.push({
      id: `resume:${slugify(rs)}`,
      group: "Resume Sections",
      title: rs,
      subtitle: "Resume section",
      href: ROUTES.resume,
      icon: GROUP_ICON["Resume Sections"],
      hay: `${rs} resume section cv`.toLowerCase(),
    });
  }

  for (const lr of LEARNING_RESOURCES) {
    items.push({
      id: `learn:${slugify(lr)}`,
      group: "Learning Resources",
      title: lr,
      subtitle: "Learning resource",
      href: ROUTES.learning,
      icon: GROUP_ICON["Learning Resources"],
      hay: `${lr} learning resource course`.toLowerCase(),
    });
  }

  INDEX = items;
  return items;
}

export interface SearchGroupResult {
  group: SearchGroup;
  items: SearchItem[];
}

/** Rank + group results for a query. Empty query → no results (UI shows discovery). */
export function searchContent(query: string, perGroup = 5): SearchGroupResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const index = buildSearchIndex();

  const scored: { item: SearchItem; score: number }[] = [];
  for (const item of index) {
    const title = item.title.toLowerCase();
    let score = 0;
    if (title === q) score = 100;
    else if (title.startsWith(q)) score = 60;
    else if (title.includes(q)) score = 40;
    else if (item.hay.includes(q)) score = 20;
    if (score > 0) scored.push({ item, score });
  }

  const byGroup = new Map<SearchGroup, { item: SearchItem; score: number }[]>();
  for (const s of scored) {
    const arr = byGroup.get(s.item.group) ?? [];
    arr.push(s);
    byGroup.set(s.item.group, arr);
  }

  const out: SearchGroupResult[] = [];
  for (const group of GROUP_ORDER) {
    const arr = byGroup.get(group);
    if (!arr || arr.length === 0) continue;
    arr.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));
    out.push({ group, items: arr.slice(0, perGroup).map((s) => s.item) });
  }
  return out;
}

/** Curated trending careers surfaced on the empty state. */
export function trendingCareers(): SearchItem[] {
  const slugs = ["ai-engineer", "data-scientist", "software-engineer", "product-manager", "ux-designer", "ml-engineer"];
  const index = buildSearchIndex();
  const bySlug = new Map(index.filter((i) => i.id.startsWith("career:")).map((i) => [i.id.replace("career:", ""), i]));
  return slugs.map((s) => bySlug.get(s)).filter((x): x is SearchItem => Boolean(x));
}

/** Suggested queries shown on the empty state. */
export const SUGGESTED_QUERIES = [
  "Software Engineer",
  "Python",
  "System Design",
  "AWS",
  "Google",
  "Frontend Roadmap",
];
