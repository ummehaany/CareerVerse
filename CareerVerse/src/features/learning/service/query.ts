/**
 * Pure, client-safe query engine for learning resources.
 *
 * Everything here is a pure function of its inputs — no I/O, no server-only
 * imports — so the *exact same* filtering, searching, ranking, and faceting
 * logic runs on the server (to personalize the initial payload) and on the
 * client (to react instantly to filter/search changes). Swapping the storage
 * layer (JSON → Firestore → CMS → API) never touches any of this.
 */

import type {
  LearningResource,
  LearningResourceView,
  LearningFilters,
  LearningFacets,
  RecommendationContext,
  SortKey,
  Difficulty,
  ResourceType,
  Pricing,
} from "../types";

const DIFFICULTIES: readonly Difficulty[] = ["Beginner", "Intermediate", "Advanced"];
const RESOURCE_TYPES: readonly ResourceType[] = [
  "Course",
  "Project",
  "Book",
  "Video",
  "Article",
  "Tool",
  "Certification",
  "Practice",
];
const PRICING: readonly Pricing[] = ["Free", "Freemium", "Paid"];

/** Canonical, ordered duration buckets used by both the facet and the filter. */
export const DURATION_BUCKETS = [
  "≤ 2 hours",
  "2–10 hours",
  "10–40 hours",
  "40+ hours",
  "Self-paced",
] as const;

export const DEFAULT_FILTERS: LearningFilters = {
  career: "",
  skill: "",
  difficulty: "",
  category: "",
  provider: "",
  resourceType: "",
  pricing: "",
  duration: "",
  savedOnly: false,
  search: "",
};

// ── Normalization ────────────────────────────────────────────────────────────
// Raw records (from JSON, Firestore, a CMS, or an API) are untrusted and loosely
// typed. `normalizeResource` coerces one into a valid, fully-typed record with
// safe defaults, tolerating unknown extra fields (forward-compatible schema).

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((x): x is string => typeof x === "string");
  if (typeof value === "string" && value.trim()) return [value];
  return [];
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  if (typeof value === "string") {
    const hit = allowed.find((a) => a.toLowerCase() === value.toLowerCase());
    if (hit) return hit;
  }
  return fallback;
}

export function normalizeResource(raw: Record<string, unknown>): LearningResource {
  const r = raw ?? {};
  return {
    ...r,
    id: String(r.id ?? ""),
    title: String(r.title ?? "Untitled"),
    description: String(r.description ?? ""),
    category: String(r.category ?? "General"),
    subcategory: typeof r.subcategory === "string" ? r.subcategory : undefined,
    difficulty: oneOf(r.difficulty, DIFFICULTIES, "Beginner"),
    careerTags: toStringArray(r.careerTags),
    skillsCovered: toStringArray(r.skillsCovered),
    provider: String(r.provider ?? "Unknown"),
    resourceType: oneOf(r.resourceType, RESOURCE_TYPES, "Course"),
    duration: typeof r.duration === "string" ? r.duration : undefined,
    language: typeof r.language === "string" ? r.language : undefined,
    freeOrPaid: oneOf(r.freeOrPaid, PRICING, "Free"),
    rating: typeof r.rating === "number" ? r.rating : undefined,
    thumbnail: typeof r.thumbnail === "string" ? r.thumbnail : null,
    resourceUrl: String(r.resourceUrl ?? "#"),
    tags: toStringArray(r.tags),
    prerequisites: toStringArray(r.prerequisites),
    featured: Boolean(r.featured),
    recommended: Boolean(r.recommended),
    trending: Boolean(r.trending),
    createdAt: typeof r.createdAt === "string" ? r.createdAt : undefined,
    updatedAt: typeof r.updatedAt === "string" ? r.updatedAt : undefined,
  };
}

export function normalizeCatalog(raw: unknown[]): LearningResource[] {
  return raw.map((x) => normalizeResource(x as Record<string, unknown>)).filter((r) => r.id);
}

// ── Duration bucketing ───────────────────────────────────────────────────────

/** Best-effort parse of a human duration string into study hours. */
export function durationHours(duration?: string): number | null {
  if (!duration) return null;
  const s = duration.toLowerCase();
  if (s.includes("self") || s.includes("ongoing")) return null;
  const match = s.match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const n = parseFloat(match[1]!);
  if (s.includes("min")) return n / 60;
  if (s.includes("week")) return n * 10;
  if (s.includes("month")) return n * 40;
  if (s.includes("day")) return n * 3;
  return n; // "hours" / "hrs" / bare number
}

export function durationBucket(duration?: string): string {
  const h = durationHours(duration);
  if (h == null) return "Self-paced";
  if (h <= 2) return DURATION_BUCKETS[0];
  if (h <= 10) return DURATION_BUCKETS[1];
  if (h <= 40) return DURATION_BUCKETS[2];
  return DURATION_BUCKETS[3];
}

// ── Search + filtering ───────────────────────────────────────────────────────

function norm(value: string): string {
  return value.toLowerCase().trim();
}

/** All searchable text for a resource, lowercased. */
export function resourceHaystack(r: LearningResource): string {
  return [
    r.title,
    r.description,
    r.provider,
    r.category,
    r.subcategory ?? "",
    ...r.skillsCovered,
    ...r.careerTags,
    ...(r.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();
}

function includesCI(list: string[], value: string): boolean {
  const v = norm(value);
  return list.some((x) => norm(x) === v);
}

/** Whether a resource passes every active filter (filters combine with AND). */
export function matchesFilters(r: LearningResourceView, f: LearningFilters): boolean {
  if (f.savedOnly && !r.bookmarked) return false;
  if (f.career && !includesCI(r.careerTags, f.career)) return false;
  if (f.skill && !includesCI(r.skillsCovered, f.skill)) return false;
  if (f.difficulty && r.difficulty !== f.difficulty) return false;
  if (f.category && r.category !== f.category) return false;
  if (f.provider && r.provider !== f.provider) return false;
  if (f.resourceType && r.resourceType !== f.resourceType) return false;
  if (f.pricing && r.freeOrPaid !== f.pricing) return false;
  if (f.duration && durationBucket(r.duration) !== f.duration) return false;
  const q = f.search.trim().toLowerCase();
  if (q && !resourceHaystack(r).includes(q)) return false;
  return true;
}

export function sortResources(list: LearningResourceView[], key: SortKey): LearningResourceView[] {
  const copy = [...list];
  switch (key) {
    case "rating":
      copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0) || a.title.localeCompare(b.title));
      break;
    case "newest":
      copy.sort((a, b) =>
        (b.updatedAt ?? b.createdAt ?? "").localeCompare(a.updatedAt ?? a.createdAt ?? ""),
      );
      break;
    case "title":
      copy.sort((a, b) => a.title.localeCompare(b.title));
      break;
    case "relevance":
    default:
      copy.sort((a, b) => b.relevanceScore - a.relevanceScore || (b.rating ?? 0) - (a.rating ?? 0));
      break;
  }
  return copy;
}

export interface QueryResult {
  items: LearningResourceView[];
  total: number;
}

/** Filter → sort → (optional) limit, in one pass. `limit` powers pagination. */
export function queryResources(
  all: LearningResourceView[],
  filters: LearningFilters,
  sort: SortKey,
  limit?: number,
): QueryResult {
  const filtered = all.filter((r) => matchesFilters(r, filters));
  const sorted = sortResources(filtered, sort);
  const items = typeof limit === "number" ? sorted.slice(0, Math.max(0, limit)) : sorted;
  return { items, total: sorted.length };
}

// ── Personalized ranking ─────────────────────────────────────────────────────

function overlapCount(values: string[], set: Set<string>): number {
  let count = 0;
  for (const v of values) if (set.has(norm(v))) count += 1;
  return count;
}

/**
 * Deterministic 0–100 relevance score. Higher = more relevant to this user.
 * The weighting is explainable by design: the biggest boost is for resources
 * that close a *known skill gap*, then alignment with the active roadmap, then
 * building on existing skills and interests, with editorial/quality signals as
 * tiebreakers. Already-completed resources are pushed to the bottom.
 */
export function scoreResource(r: LearningResource, ctx: RecommendationContext): number {
  const skills = new Set(ctx.skills.map(norm));
  const interests = new Set(ctx.interests.map(norm));
  const missing = new Set(ctx.missingSkills.map(norm));
  const roadmap = new Set(ctx.roadmapSkills.map(norm));
  const target = norm(ctx.targetCareer);
  const goal = norm(ctx.careerGoal);

  let score = 0;
  score += overlapCount(r.skillsCovered, missing) * 20;
  score += overlapCount(r.skillsCovered, roadmap) * 12;
  score += overlapCount(r.skillsCovered, skills) * 6;
  score += overlapCount([...r.careerTags, r.category, ...(r.tags ?? [])], interests) * 5;

  if (target && r.careerTags.some((t) => {
    const n = norm(t);
    return n.includes(target) || target.includes(n);
  })) {
    score += 16;
  }
  if (goal && resourceHaystack(r).includes(goal)) score += 6;

  if (r.featured) score += 5;
  if (r.recommended) score += 4;
  if (r.trending) score += 3;
  if (typeof r.rating === "number") score += Math.max(0, r.rating - 3) * 2;

  if (ctx.completedIds.includes(r.id)) score -= 50;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/** Attach a personalized `relevanceScore` and sort best-first. */
export function rankResources(
  resources: LearningResource[],
  ctx: RecommendationContext,
): Array<LearningResource & { relevanceScore: number }> {
  return resources
    .map((r) => ({ ...r, relevanceScore: scoreResource(r, ctx) }))
    .sort((a, b) => b.relevanceScore - a.relevanceScore || (b.rating ?? 0) - (a.rating ?? 0));
}

// ── Facets ───────────────────────────────────────────────────────────────────

function uniqSorted(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) => a.localeCompare(b));
}

/** Distinct filter values present in the dataset, for building filter controls. */
export function buildFacets(resources: LearningResource[]): LearningFacets {
  const careers: string[] = [];
  const skills: string[] = [];
  const categories: string[] = [];
  const providers: string[] = [];
  const durations = new Set<string>();

  for (const r of resources) {
    careers.push(...r.careerTags);
    skills.push(...r.skillsCovered);
    categories.push(r.category);
    providers.push(r.provider);
    durations.add(durationBucket(r.duration));
  }

  return {
    careers: uniqSorted(careers),
    skills: uniqSorted(skills),
    categories: uniqSorted(categories),
    providers: uniqSorted(providers),
    resourceTypes: RESOURCE_TYPES.filter((t) => resources.some((r) => r.resourceType === t)),
    difficulties: DIFFICULTIES.filter((d) => resources.some((r) => r.difficulty === d)),
    pricing: PRICING.filter((p) => resources.some((r) => r.freeOrPaid === p)),
    durations: DURATION_BUCKETS.filter((b) => durations.has(b)),
  };
}
