export type Proficiency = "beginner" | "intermediate" | "advanced";

export interface UserSkillInput {
  name: string;
  proficiency: Proficiency;
}

/** Lightweight career shape the analysis needs (from catalog, serialized). */
export interface SkillGapCareer {
  slug: string;
  title: string;
  category: string;
  skills: string[];
  difficulty: number;
  certifications: string[];
}

export type SkillStatus = "mastered" | "partial" | "missing";
export type Priority = "Critical" | "High" | "Medium";

export interface AnalyzedSkill {
  skill: string;
  status: SkillStatus;
  category: string;
  critical: boolean;
  proficiency: Proficiency | null;
  /** 0 | 50 | 100 contribution. */
  score: number;
}

export interface CategoryScore {
  category: string;
  score: number;
  total: number;
  mastered: number;
}

export interface SkillRecommendation {
  skill: string;
  priority: Priority;
  estWeeks: number;
  certifications: string[];
  projects: string[];
  resource: { title: string; url: string } | null;
}

export interface ActionStage {
  title: string;
  timeline: string;
  focus: string;
  skills: string[];
}

export interface GapAnalysis {
  careerSlug: string;
  careerTitle: string;
  readinessScore: number;
  totalRequired: number;
  mastered: AnalyzedSkill[];
  partial: AnalyzedSkill[];
  missing: AnalyzedSkill[];
  categories: CategoryScore[];
  recommendations: SkillRecommendation[];
  actionPlan: ActionStage[];
}
