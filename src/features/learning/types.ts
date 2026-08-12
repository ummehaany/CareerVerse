/**
 * Learning resource domain model.
 *
 * The canonical schema uses descriptive field names and is intentionally
 * forward-compatible: every non-core field is optional and an index signature
 * tolerates unknown future fields, so new attributes can be added to the data
 * source (JSON, Firestore, CMS, API) without breaking existing records or code.
 */

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";
export type ResourceType =
  | "Course"
  | "Project"
  | "Book"
  | "Video"
  | "Article"
  | "Tool"
  | "Certification"
  | "Practice";
export type Pricing = "Free" | "Freemium" | "Paid";

export interface LearningResource {
  id: string;
  title: string;
  description: string;
  category: string;
  subcategory?: string;
  difficulty: Difficulty;
  careerTags: string[];
  skillsCovered: string[];
  provider: string;
  resourceType: ResourceType;
  duration?: string;
  language?: string;
  freeOrPaid: Pricing;
  rating?: number;
  thumbnail?: string | null;
  resourceUrl: string;
  tags?: string[];
  prerequisites?: string[];
  featured?: boolean;
  recommended?: boolean; // editorial default; per-user recommendation is computed
  trending?: boolean;
  createdAt?: string;
  updatedAt?: string;
  /** Forward-compatible: tolerate fields added later without a code change. */
  [key: string]: unknown;
}

/** Resource enriched for a specific user (per-request, serializable). */
export interface LearningResourceView extends LearningResource {
  bookmarked: boolean;
  /** Personalized 0–100 relevance; drives the default "For you" ranking. */
  relevanceScore: number;
}

/** Signals used to personalize ranking (assembled server-side, serializable). */
export interface RecommendationContext {
  skills: string[];
  interests: string[];
  careerGoal: string;
  targetCareer: string;
  targetCompanies: string[];
  missingSkills: string[];
  roadmapSkills: string[];
  completedIds: string[];
}

export interface LearningFilters {
  career: string;
  skill: string;
  difficulty: string;
  category: string;
  provider: string;
  resourceType: string;
  pricing: string;
  duration: string;
  savedOnly: boolean;
  search: string;
}

export type SortKey = "relevance" | "rating" | "newest" | "title";

/** Distinct values for each filter, derived from the dataset. */
export interface LearningFacets {
  careers: string[];
  skills: string[];
  categories: string[];
  providers: string[];
  resourceTypes: string[];
  difficulties: string[];
  pricing: string[];
  durations: string[];
}
