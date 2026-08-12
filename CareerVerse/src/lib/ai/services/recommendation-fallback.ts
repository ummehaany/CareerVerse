import type { StructuredProfile } from "@/types/assessment";
import type { CareerRecommendation } from "@/types/recommendation";
import type { Career } from "@/lib/careers/types";
import { getCareers } from "@/lib/careers/catalog";
import { getIndiaSalaryLpa } from "@/lib/careers/salary-india";
import { getCareerEnrichment } from "@/lib/careers/enrich";

/*
 * Offline, rule-based recommendation engine. Produces a high-quality Top 5
 * purely from the local career catalog + the user's structured profile, so the
 * feature never fails when the AI provider is unavailable or over quota.
 */

function norm(value: string): string {
  return value.toLowerCase().trim();
}

function profileTerms(profile: StructuredProfile): string[] {
  return [
    ...profile.interests,
    ...profile.technicalSkills,
    ...profile.softSkills,
    ...profile.strengths,
    ...profile.values,
    ...(profile.goals?.targetRoles ?? []),
    profile.industryDirection ?? "",
    profile.goals?.aspiration ?? "",
    profile.primaryMotivator ?? "",
    profile.education?.field ?? "",
  ]
    .map(norm)
    .filter(Boolean);
}

function demandBoost(demand: Career["demand"]): number {
  switch (demand) {
    case "Very High":
      return 2;
    case "High":
      return 1.5;
    case "Growing":
      return 1;
    default:
      return 0.5;
  }
}

function scoreCareer(career: Career, terms: string[], targetRoles: string[]): number {
  let score = 0;
  const haystack = norm(
    `${career.title} ${career.category} ${career.tagline} ${career.whatDoes} ${career.skills.join(" ")}`,
  );

  for (const term of terms) {
    if (!term) continue;
    if (haystack.includes(term)) {
      score += 3;
    } else {
      for (const token of term.split(/\s+/)) {
        if (token.length > 3 && haystack.includes(token)) score += 1;
      }
    }
  }

  for (const role of targetRoles) {
    const r = norm(role);
    if (r && (norm(career.title).includes(r) || r.includes(norm(career.title)))) score += 8;
  }

  return score + demandBoost(career.demand);
}

function toRecommendation(
  career: Career,
  score: number,
  maxScore: number,
  index: number,
  userSkills: Set<string>,
): CareerRecommendation {
  const enrich = getCareerEnrichment(career);
  const { minLpa, maxLpa } = getIndiaSalaryLpa(career.slug, career.salary);

  const base = maxScore > 0 ? score / maxScore : 0;
  const matchPercentage = Math.max(55, Math.min(96, Math.round(58 + base * 32 - index * 2)));

  const have = career.skills.filter((skill) =>
    [...userSkills].some((u) => u.includes(norm(skill)) || norm(skill).includes(u)),
  );
  const improve = career.skills.filter((skill) => !have.includes(skill)).slice(0, 5);
  const strengths = have.length ? have.slice(0, 5) : career.skills.slice(0, 3);

  return {
    title: career.title,
    matchPercentage,
    overview: career.whatDoes,
    whyItMatches: `This path aligns well with your profile — your interests and strengths map to ${career.skills
      .slice(0, 3)
      .join(", ")}. ${career.title} is in ${career.demand.toLowerCase()} demand in India (${career.growth}).`,
    strengthsIdentified: strengths.length ? strengths : ["Adaptability", "Willingness to learn"],
    skillsToImprove: improve.length ? improve : career.skills.slice(0, 3),
    salaryRange: { currency: "INR", min: minLpa, max: maxLpa, period: "year" },
    industryGrowth: { outlook: career.demand, summary: enrich.futureDemandIndia },
    requiredEducation: career.education,
    recommendedCertifications: career.certifications,
    futureOpportunities: enrich.growthPath.slice(1),
  };
}

/** Build a Top 5 recommendation set from local data — never throws. */
export function buildFallbackRecommendations(profile: StructuredProfile): CareerRecommendation[] {
  const careers = getCareers();
  const terms = profileTerms(profile);
  const targetRoles = profile.goals?.targetRoles ?? [];
  const userSkills = new Set(
    [...profile.technicalSkills, ...profile.softSkills].map(norm).filter(Boolean),
  );

  const ranked = careers
    .map((career) => ({ career, score: scoreCareer(career, terms, targetRoles) }))
    .sort((a, b) => b.score - a.score);

  const maxScore = ranked[0]?.score || 1;

  return ranked
    .slice(0, 5)
    .map(({ career, score }, index) => toRecommendation(career, score, maxScore, index, userSkills));
}
