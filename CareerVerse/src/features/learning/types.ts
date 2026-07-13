export type ResourceType = "course" | "video" | "article" | "book" | "practice" | "tool";
export type ResourceLevel = "beginner" | "intermediate" | "advanced" | "all";
export type ResourceCost = "free" | "freemium" | "paid";

export interface LearningResource {
  id: string;
  title: string;
  provider: string;
  url: string;
  description: string;
  category: string;
  type: ResourceType;
  level: ResourceLevel;
  cost: ResourceCost;
  /** Skill tags aligned with assessment skill labels for personalization. */
  skills: string[];
}

export interface LearningResourceView extends LearningResource {
  bookmarked: boolean;
  recommended: boolean;
}
