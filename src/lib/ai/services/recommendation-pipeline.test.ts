import { describe, it, expect, vi } from "vitest";
import type { CareerMatch } from "@/features/assessment/discovery/types";
import type { CareerRecommendation } from "@/types/recommendation";
import type { StructuredProfile } from "@/types/assessment";
import { scoreCareerDiscovery } from "@/features/assessment/discovery/scoring";
import { getCareer } from "@/lib/careers/catalog";
import { buildDeterministicRecommendations } from "./recommendation-fallback";

/*
 * Deterministic tests for the "key recommendation flow": the layer that
 * turns Career Discovery's own ranked matches into what actually renders on
 * the /recommendations ("Career Matches") page. This is the part of the
 * product that used to let an AI freely invent an unrelated Top 5 — these
 * tests lock in the fix: title and matchPercentage always come straight
 * from the deterministic engine, and even an adversarial AI response can
 * only ever change wording, never which careers are shown.
 */

function emptyProfile(overrides: Partial<StructuredProfile> = {}): StructuredProfile {
  return {
    interests: [],
    workActivities: [],
    industryDirection: null,
    education: { level: null, field: null, status: null },
    technicalSkills: [],
    technicalProficiency: null,
    learningAgility: null,
    softSkills: [],
    communicationConfidence: null,
    strengths: [],
    growthAreas: [],
    selfMotivation: null,
    personality: { socialEnergy: null, decisionStyle: null, structurePreference: null },
    workStyle: { collaboration: null, environment: null, pace: null },
    values: [],
    primaryMotivator: null,
    leadership: { interest: null, teamRole: null },
    problemSolving: { approach: null, creativity: null },
    learningPreferences: [],
    goals: { horizon: null, targetRoles: [], aspiration: null },
    ...overrides,
  };
}

const dataScienceAnswers = {
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
};

describe("buildDeterministicRecommendations", () => {
  it("title and matchPercentage always come directly from the CareerMatch, never re-derived", () => {
    const { all } = scoreCareerDiscovery(dataScienceAnswers, null);
    const topMatches = all.slice(0, 5);
    const recommendations = buildDeterministicRecommendations(topMatches, emptyProfile());

    expect(recommendations).toHaveLength(5);
    recommendations.forEach((rec, i) => {
      expect(rec.title).toBe(topMatches[i]!.title);
      expect(rec.matchPercentage).toBe(topMatches[i]!.matchPercent);
      // Default explanation text is the deterministic engine's own reasoning.
      expect(rec.whyItMatches).toBe(topMatches[i]!.explanation);
    });
  });

  it("every recommended title resolves to a real catalog career (never an invented one)", () => {
    const { all } = scoreCareerDiscovery(dataScienceAnswers, null);
    const recommendations = buildDeterministicRecommendations(all.slice(0, 5), emptyProfile());
    for (const rec of recommendations) {
      const matchingCareer = all.find((m) => m.title === rec.title);
      expect(matchingCareer).toBeTruthy();
      expect(getCareer(matchingCareer!.catalogSlug)).toBeTruthy();
    }
  });

  it("is deterministic — same matches + profile in, same recommendations out", () => {
    const { all } = scoreCareerDiscovery(dataScienceAnswers, null);
    const topMatches = all.slice(0, 5);
    const profile = emptyProfile({ technicalSkills: ["Python", "Statistics"] });
    const first = buildDeterministicRecommendations(topMatches, profile);
    const second = buildDeterministicRecommendations(topMatches, profile);
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
  });
});

// ── personalizeRecommendations: AI can reword, never rename or re-score ────

vi.mock("@/lib/ai/index", () => ({
  getAIProvider: () => ({
    name: "mock-provider",
    model: "mock-model",
    capabilities: { streaming: false, embeddings: false, structuredOutput: true },
    generateObject: vi.fn().mockResolvedValue({
      data: {
        personalizations: [
          { index: 0, whyItMatches: "Personalized reason for the #0 career, grounded in the profile." },
          { index: 1, whyItMatches: "Personalized reason for the #1 career." },
          // Adversarial: out of range for a 2-item base — must be dropped, not throw.
          { index: 99, whyItMatches: "This should never be applied anywhere." },
          // Adversarial: duplicate index — the second occurrence must be ignored.
          { index: 0, whyItMatches: "This duplicate must NOT overwrite the first personalization." },
        ],
      },
      usage: { inputTokens: 42, outputTokens: 17, totalTokens: 59 },
    }),
  }),
}));

function makeMatch(slug: string, title: string, matchPercent: number): CareerMatch {
  return {
    id: slug,
    title,
    category: "Technology",
    catalogSlug: slug,
    fieldId: "technology",
    fieldLabel: "Technology & Data",
    matchPercent,
    explanation: `Deterministic explanation for ${title}.`,
    drivers: ["analytical thinking"],
  };
}

function makeBaseRec(title: string, matchPercentage: number): CareerRecommendation {
  return {
    title,
    matchPercentage,
    overview: "Default overview.",
    whyItMatches: "Default deterministic explanation.",
    strengthsIdentified: ["Analytical thinking"],
    skillsToImprove: ["Communication"],
    salaryRange: { currency: "INR", min: 8, max: 35, period: "year" },
    industryGrowth: { outlook: "Very High", summary: "Strong demand." },
    requiredEducation: "Bachelor's/Master's in a quantitative field",
    recommendedCertifications: ["Google Data Analytics"],
    futureOpportunities: ["Senior Data Scientist", "ML Engineer"],
  };
}

describe("personalizeRecommendations", () => {
  it("never changes title or matchPercentage, and ignores out-of-range/duplicate AI indices", async () => {
    const { personalizeRecommendations } = await import("./career-recommender");

    const base = [makeBaseRec("Data Scientist", 91), makeBaseRec("ML Engineer", 84)];
    const matches = [makeMatch("data-scientist", "Data Scientist", 91), makeMatch("ml-engineer", "ML Engineer", 84)];
    const profile = emptyProfile({ interests: ["Programming & Technology"] });

    const result = await personalizeRecommendations(base, matches, profile);

    // Identity and score are untouched — this is the core guarantee.
    expect(result.recommendations.map((r) => r.title)).toEqual(["Data Scientist", "ML Engineer"]);
    expect(result.recommendations.map((r) => r.matchPercentage)).toEqual([91, 84]);

    // Valid personalizations were applied...
    expect(result.recommendations[0]!.whyItMatches).toBe("Personalized reason for the #0 career, grounded in the profile.");
    expect(result.recommendations[1]!.whyItMatches).toBe("Personalized reason for the #1 career.");

    // ...but the out-of-range index and the duplicate were both dropped, not applied.
    expect(result.personalizedCount).toBe(2);
    const whyTexts = result.recommendations.map((r) => r.whyItMatches);
    expect(whyTexts).not.toContain("This should never be applied anywhere.");
    expect(whyTexts).not.toContain("This duplicate must NOT overwrite the first personalization.");
  });

  it("throws (so the caller falls back to the deterministic base) when the profile has no signal at all", async () => {
    const { personalizeRecommendations } = await import("./career-recommender");
    const base = [makeBaseRec("Data Scientist", 91)];
    const matches = [makeMatch("data-scientist", "Data Scientist", 91)];
    await expect(personalizeRecommendations(base, matches, emptyProfile())).rejects.toThrow();
  });
});
