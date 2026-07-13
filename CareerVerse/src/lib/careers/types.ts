export type DemandLevel = "Stable" | "Steady" | "Growing" | "High" | "Very High";

export interface CareerSalary {
  currency: string;
  min: number;
  max: number;
}

export interface Career {
  slug: string;
  title: string;
  category: string;
  tagline: string;
  whatDoes: string;
  skills: string[];
  education: string;
  salary: CareerSalary;
  demand: DemandLevel;
  /** Short outlook string, e.g. "+22% (much faster than average)". */
  growth: string;
  /** 1 (poor) – 5 (excellent). */
  workLifeBalance: number;
  /** 1 (accessible) – 5 (very demanding) barrier to entry. */
  difficulty: number;
  companies: string[];
  certifications: string[];
}

export interface CareerInsightProject {
  title: string;
  description: string;
}

export interface CareerInsightStep {
  stage: string;
  focus: string;
}

/** AI-generated, career-general insights cached in `careerInsights/{slug}`. */
export interface CareerInsights {
  dayInLife: string;
  insights: string[];
  recommendedProjects: CareerInsightProject[];
  learningPath: CareerInsightStep[];
  outlook: string;
}
