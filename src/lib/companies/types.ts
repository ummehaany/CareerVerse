/*
 * Target Companies — domain types.
 *
 * The catalog stores a lightweight CompanyRecord per company; the full,
 * richly-sectioned CompanyProfile is generated on demand by buildCompanyProfile
 * from the record plus tier-based defaults. This keeps the catalog small enough
 * to scale to hundreds of companies while every profile page stays complete.
 */

export type CompanyTier =
  | "faang"
  | "bigtech"
  | "startup"
  | "consulting"
  | "finance"
  | "itservices";

export type CompanyCategory =
  | "Big Tech"
  | "High-Growth"
  | "Consulting"
  | "Finance"
  | "IT Services";

export type RoleFamily = "Engineering" | "Data & AI" | "Product & Design" | "Business";

/** A reusable role definition shared across companies. */
export interface RoleTemplate {
  key: string;
  title: string;
  family: RoleFamily;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  education: string;
  certifications: string[];
  experience: string;
  /** Base annual band in ₹ LPA, scaled per-company by salaryFactor. */
  baseSalaryLpa: [number, number];
  interviewTopics: string[];
  /** Typical career progression path for the role. */
  progression: string[];
}

/** A role as offered by a specific company (salary resolved to that company). */
export interface CompanyRole extends Omit<RoleTemplate, "baseSalaryLpa"> {
  salaryLpa: [number, number];
  salaryLabel: string;
}

/** The compact, hand-maintained record for one company. */
export interface CompanyRecord {
  slug: string;
  name: string;
  category: CompanyCategory;
  tier: CompanyTier;
  industry: string;
  hq: string;
  founded: number;
  size: string;
  /** Brand accent color (hex) used for gradients and highlights. */
  brand: string;
  tagline: string;
  about: string;
  mission: string;
  cultureValues: string[];
  products: string[];
  engineeringCulture: string;
  offices: string[];
  /** 1 (accessible) – 5 (extremely selective). */
  difficulty: number;
  interviewFocus: string[];
  /** Multiplies role base salary bands. */
  salaryFactor: number;
  /** Company-specific perks appended to tier defaults. */
  perks: string[];
  /** Extra role keys beyond the tier default set. */
  extraRoleKeys?: string[];
}

export interface HiringStage {
  stage: string;
  detail: string;
}

export interface TimelinePhase {
  phase: string;
  duration: string;
}

export interface InternshipProgram {
  title: string;
  description: string;
  stipend: string;
  duration: string;
}

export interface GraduateProgram {
  title: string;
  description: string;
}

/** The fully-expanded profile rendered on a company page. */
export interface CompanyProfile {
  record: CompanyRecord;
  roles: CompanyRole[];
  hiringProcess: HiringStage[];
  recruitmentStages: string[];
  eligibility: string[];
  hiringTimeline: TimelinePhase[];
  internship: InternshipProgram;
  graduateProgram: GraduateProgram;
  benefits: string[];
  workEnvironment: string;
  growthOpportunities: string[];
  careerOpportunities: string;
  salaryRange: { min: number; max: number; label: string };
}

/** Lightweight shape for home-grid cards. */
export interface CompanyCardData {
  slug: string;
  name: string;
  category: CompanyCategory;
  industry: string;
  hq: string;
  tagline: string;
  brand: string;
  difficulty: number;
  roleCount: number;
  /** Root domain for the official logo (from the central links registry). */
  domain: string;
}
