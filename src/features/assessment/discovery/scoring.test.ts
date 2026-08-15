import { describe, it, expect } from "vitest";
import { scoreCareerDiscovery } from "./scoring";
import { getCareer } from "@/lib/careers/catalog";
import type { DiscoveryAnswers } from "./types";

/*
 * Deterministic tests for the Career Discovery scoring engine — the single
 * source of truth for career matching (per product decision: the AI layer
 * must never invent or override what this engine ranks). These tests exist
 * specifically to catch the class of bug this whole rework was about: a
 * persona whose answers clearly point at one field/career producing a
 * Top-3 that points somewhere unrelated (e.g. "Project Manager" for a
 * Data Science-signaling profile).
 */

// ── Personas — Core (20-question) answer sets ──────────────────────────────
// Every key below matches a real BASIC_QUESTIONS id in ./questions.ts.

const dataScience: DiscoveryAnswers = {
  fieldInterest: "technology",
  excitingActivity: "research_analyze",
  favoriteSubjects: "math_analytics",
  problemSolvingStyle: "logic_analysis",
  peopleOrientation: "independent",
  strengths: ["analytical", "technical"],
  motivation: "discovery",
  values: "intellectual_challenge",
  learningStyle: "reading",
  educationLevel: "graduate",
  fieldOfStudyOrWork: "technology",
  technicalConfidence: "5",
  learningAgilityLevel: "4",
  communicationConfidenceLevel: "3",
  growthAreas: ["communication"],
  workEnvironmentPreference: "remote_independent",
  workPace: "flexible_self_paced",
  structurePreference: "mix_of_both",
  goalHorizon: "launching_a_career",
  organizationInterest: ["a", "b"],
};

const softwareEngineering: DiscoveryAnswers = {
  fieldInterest: "technology",
  excitingActivity: "build_something",
  favoriteSubjects: "programming_tech",
  problemSolvingStyle: "experimenting",
  peopleOrientation: "team_collab",
  strengths: ["technical", "analytical"],
  motivation: "innovation",
  values: "independence",
  learningStyle: "hands_on",
  educationLevel: "undergraduate",
  fieldOfStudyOrWork: "technology",
  technicalConfidence: "5",
  learningAgilityLevel: "5",
  communicationConfidenceLevel: "3",
  growthAreas: ["leadership"],
  workEnvironmentPreference: "hybrid",
  workPace: "fast_paced",
  structurePreference: "creative_freedom",
  goalHorizon: "launching_a_career",
};

const nutritionHealthcare: DiscoveryAnswers = {
  fieldInterest: "healthcare",
  excitingActivity: "helping_people",
  favoriteSubjects: "science_biology",
  problemSolvingStyle: "collaborating",
  peopleOrientation: "direct_people",
  strengths: ["empathy", "communication"],
  motivation: "helping_others",
  values: "social_impact",
  learningStyle: "mentors",
  educationLevel: "undergraduate",
  fieldOfStudyOrWork: "healthcare",
  technicalConfidence: "2",
  learningAgilityLevel: "3",
  communicationConfidenceLevel: "4",
  growthAreas: ["organization"],
  workEnvironmentPreference: "office_team",
  workPace: "steady_predictable",
  structurePreference: "clear_rules",
  goalHorizon: "building_foundational_skills",
};

const design: DiscoveryAnswers = {
  fieldInterest: "design_creative",
  excitingActivity: "design_visually",
  favoriteSubjects: "design_arts",
  problemSolvingStyle: "creativity",
  peopleOrientation: "team_collab",
  strengths: ["creativity", "communication"],
  motivation: "innovation",
  values: "creative_freedom",
  learningStyle: "videos",
  educationLevel: "undergraduate",
  fieldOfStudyOrWork: "design_creative",
  technicalConfidence: "3",
  learningAgilityLevel: "4",
  communicationConfidenceLevel: "4",
  growthAreas: ["technical"],
  workEnvironmentPreference: "hybrid",
  workPace: "flexible_self_paced",
  structurePreference: "creative_freedom",
  goalHorizon: "launching_a_career",
};

const psychology: DiscoveryAnswers = {
  fieldInterest: "healthcare",
  excitingActivity: "helping_people",
  favoriteSubjects: "psychology_behavior",
  problemSolvingStyle: "collaborating",
  peopleOrientation: "direct_people",
  strengths: ["empathy", "communication"],
  motivation: "helping_others",
  values: "social_impact",
  learningStyle: "mentors",
  educationLevel: "graduate",
  fieldOfStudyOrWork: "healthcare",
  technicalConfidence: "2",
  learningAgilityLevel: "3",
  communicationConfidenceLevel: "5",
  growthAreas: ["organization"],
  workEnvironmentPreference: "office_team",
  workPace: "steady_predictable",
  structurePreference: "mix_of_both",
  goalHorizon: "advancing_or_switching",
};

const business: DiscoveryAnswers = {
  fieldInterest: "business",
  excitingActivity: "lead_grow",
  favoriteSubjects: "business_economics",
  problemSolvingStyle: "collaborating",
  peopleOrientation: "team_collab",
  strengths: ["leadership", "communication"],
  motivation: "leadership_recognition",
  values: "financial_growth",
  learningStyle: "group",
  educationLevel: "working_professional",
  fieldOfStudyOrWork: "business",
  technicalConfidence: "3",
  learningAgilityLevel: "4",
  communicationConfidenceLevel: "5",
  growthAreas: ["technical"],
  workEnvironmentPreference: "office_team",
  workPace: "fast_paced",
  structurePreference: "mix_of_both",
  goalHorizon: "advancing_or_switching",
};

const mixedTechBusiness: DiscoveryAnswers = {
  fieldInterest: "technology",
  excitingActivity: "lead_grow",
  favoriteSubjects: "programming_tech",
  problemSolvingStyle: "logic_analysis",
  peopleOrientation: "team_collab",
  strengths: ["technical", "leadership"],
  motivation: "innovation",
  values: "financial_growth",
  learningStyle: "hands_on",
  educationLevel: "undergraduate",
  fieldOfStudyOrWork: "business",
  technicalConfidence: "4",
  learningAgilityLevel: "4",
  communicationConfidenceLevel: "4",
  growthAreas: ["business"],
  workEnvironmentPreference: "hybrid",
  workPace: "fast_paced",
  structurePreference: "mix_of_both",
  goalHorizon: "advancing_or_switching",
};

describe("scoreCareerDiscovery — determinism", () => {
  it("produces byte-identical results for identical answers, every time", () => {
    const runs = Array.from({ length: 5 }, () => scoreCareerDiscovery(dataScience, null));
    const serialized = runs.map((r) => JSON.stringify(r));
    expect(new Set(serialized).size).toBe(1);
  });

  it("ranking is a pure function of the answers — no dependence on call order or shared state", () => {
    const a = scoreCareerDiscovery(dataScience, null);
    const b = scoreCareerDiscovery(softwareEngineering, null);
    const aAgain = scoreCareerDiscovery(dataScience, null);
    expect(JSON.stringify(a)).toBe(JSON.stringify(aAgain));
    // Two genuinely different personas should not collapse to the same ranking.
    expect(JSON.stringify(a)).not.toBe(JSON.stringify(b));
  });
});

describe("scoreCareerDiscovery — the mandatory 20-question Core tier stands on its own", () => {
  it("Data Science persona: top match is a Data & AI / Technology career, confidently, and NOT an unrelated field", () => {
    const result = scoreCareerDiscovery(dataScience, null);
    const top = result.top[0]!;

    // Field/category-level correctness is what the Core 20-question tier
    // can reliably promise on its own — cleanly separating close, adjacent
    // titles WITHIN that field (Data Scientist vs. Cybersecurity Analyst vs.
    // Statistician, all genuinely analytical/technical/independent-leaning
    // Technology & Data roles) is the Deep 30-question tier's job. All of
    // the top-3 here must still be real Data & AI / Technology careers.
    expect(["Data & AI", "Technology"]).toContain(top.category);
    result.top.forEach((m) => expect(["Data & AI", "Technology"]).toContain(m.category));
    expect(top.matchPercent).toBeGreaterThanOrEqual(40);
    expect(result.topField.percent).toBeGreaterThanOrEqual(50);
    expect(result.topField.id).toBe("technology");

    // The exact regression this rework targets: an analytically-signaling
    // profile must not surface Project Manager (or other clearly unrelated
    // generalist roles) as its top match.
    const topTitles = result.top.map((m) => m.title);
    expect(topTitles).not.toContain("Project Manager");
    expect(topTitles).not.toContain("Nutritionist / Dietitian");
  });

  it("Software Engineering persona: top match is a hands-on Technology role, not Design/Business/Healthcare/etc.", () => {
    const result = scoreCareerDiscovery(softwareEngineering, null);
    const top = result.top[0]!;
    expect(top.category).toBe("Technology");
    // Formula C (2026-08-15, approved trait-averaging change): trait
    // compatibility now averages each career's own top-4 highest-demand
    // traits instead of all 11, which sharpens within-field ordering. For
    // this quantitative/technical persona, Quantitative Analyst (Data & AI —
    // the same broad field as Technology, and a genuinely close, legitimate
    // match for hands-on/analytical strengths) now scores close enough to
    // enter the top 3 alongside the Technology picks. This mirrors the
    // Data Science persona test above, which already accepts both
    // "Technology" and "Data & AI" as correct for the same reason. The
    // regression this test guards against (Design/Business/Healthcare
    // leaking in) is unaffected — still verified below.
    result.top.forEach((m) => expect(["Technology", "Data & AI"]).toContain(m.category));
    expect(top.matchPercent).toBeGreaterThanOrEqual(40);
  });

  it("Nutrition/Healthcare persona: top match is in Healthcare, not a technical or business field", () => {
    const result = scoreCareerDiscovery(nutritionHealthcare, null);
    const top = result.top[0]!;
    expect(top.category).toBe("Healthcare");
    expect(result.topField.id).toBe("healthcare");
    const topTitles = result.top.map((m) => m.title);
    expect(topTitles).not.toContain("Project Manager");
    expect(topTitles).not.toContain("Software Engineer");
  });

  it("Design persona: top match is a Design career", () => {
    const result = scoreCareerDiscovery(design, null);
    expect(result.top[0]!.category).toBe("Design");
  });

  it("Psychology persona: top match is Healthcare, and Psychologist appears in the top 3", () => {
    const result = scoreCareerDiscovery(psychology, null);
    expect(result.top[0]!.category).toBe("Healthcare");
    const top3Titles = result.top.map((m) => m.title);
    expect(top3Titles).toContain("Psychologist");
  });

  it("Business persona: top match is Business/Finance/Product & Management — Project Manager here is a CORRECT match, not a bug", () => {
    const result = scoreCareerDiscovery(business, null);
    const top = result.top[0]!;
    expect(["Business", "Finance", "Product & Management", "Marketing & Media"]).toContain(top.category);
  });

  it("Mixed tech+business persona: top field is technology or business, and results are stable/reproducible", () => {
    const result = scoreCareerDiscovery(mixedTechBusiness, null);
    expect(["technology", "business"]).toContain(result.topField.id);
    expect(result.top.length).toBe(3);
    expect(result.all.length).toBeGreaterThan(3);
  });
});

describe("scoreCareerDiscovery — every ranked result maps to a real catalog career", () => {
  it("no persona ever produces a title/slug that isn't in the actual catalog", () => {
    const personas = [dataScience, softwareEngineering, nutritionHealthcare, design, psychology, business, mixedTechBusiness];
    for (const persona of personas) {
      const result = scoreCareerDiscovery(persona, null);
      for (const match of result.top) {
        const career = getCareer(match.catalogSlug);
        expect(career, `catalog lookup for ${match.catalogSlug}`).toBeTruthy();
        expect(career!.title).toBe(match.title);
      }
    }
  });
});

describe("scoreCareerDiscovery — the optional 30-question Deep tier refines, doesn't overturn", () => {
  it("adding consistent advanced answers keeps the Data Science persona in the same field", () => {
    const basicOnly = scoreCareerDiscovery(dataScience, null);

    const consistentAdvanced: DiscoveryAnswers = {
      adv_problemSolving_1: "break_down",
      adv_problemSolving_2: "debug_systematically",
      adv_technicalInterest_1: "train_model",
      adv_technicalInterest_2: "dataset_model",
      adv_curiosity_1: "hidden_patterns",
      adv_criticalThinking_1: "check_data",
      adv_criticalThinking_2: "point_with_data",
      adv_decisionMaking_1: "data_evidence",
      adv_learningBehaviour_1: "study_theory",
      adv_selfManagement_1: "stays_high",
    };

    const refined = scoreCareerDiscovery(dataScience, consistentAdvanced);

    expect(refined.topField.id).toBe(basicOnly.topField.id);
    expect(["Data & AI", "Technology"]).toContain(refined.top[0]!.category);
  });

  it("is still deterministic once the advanced tier is included", () => {
    const advanced: DiscoveryAnswers = {
      adv_teamwork_1: "hardest_piece",
      adv_teamwork_2: "focus_own_work",
      adv_adaptability_1: "adjust_quickly",
      adv_adaptability_2: "relearn_fast",
    };
    const a = scoreCareerDiscovery(softwareEngineering, advanced);
    const b = scoreCareerDiscovery(softwareEngineering, advanced);
    expect(JSON.stringify(a)).toBe(JSON.stringify(b));
  });
});
