import type { StructuredProfile } from "@/types/assessment";
import type { CareerRecommendation } from "@/types/recommendation";
import type { CareerMatch } from "@/features/assessment/discovery/types";
import { getCareer } from "@/lib/careers/catalog";
import { getIndiaSalaryLpa } from "@/lib/careers/salary-india";
import { getCareerEnrichment } from "@/lib/careers/enrich";

/*
 * Deterministic career-recommendation builder — the single source of truth
 * for *which* careers appear on the Recommendations ("Career Matches") page
 * and at what match percentage.
 *
 * Previously (pre-fix) this file ran its own independent keyword-scoring
 * pass over the catalog, separate from Career Discovery's own field+trait
 * scoring engine (`features/assessment/discovery/scoring.ts`). That meant
 * two different rankings could exist for the same user, and — worse — the
 * AI recommendation path didn't use either ranking, it invented its own Top
 * 5 from a thin profile summary with no catalog grounding at all. That's
 * what let an unrelated career (e.g. "Project Manager" for a profile whose
 * answers pointed at Data Science) show up as a "recommendation."
 *
 * This function now takes Discovery's own already-ranked `CareerMatch[]`
 * (recomputed server-side from the user's stored answers via
 * `scoreCareerDiscovery`, so it's always in sync and reproducible from the
 * same inputs) and only adds deterministic catalog enrichment on top —
 * salary, education, certifications, growth path, and a skill-gap diff
 * against the user's own profile. Title and matchPercentage always come
 * directly from the `CareerMatch`, never re-derived or guessed here or by
 * an AI. `whyItMatches` defaults to the match's own machine-generated
 * explanation; `lib/ai/services/career-recommender.ts` may optionally
 * rewrite the *wording* of a few narrative fields afterward, but it has no
 * ability to change which career this is or its score (see that file).
 */

function norm(value: string): string {
  return value.toLowerCase().trim();
}

/** Build the Top-N `CareerRecommendation` set directly from Discovery's ranked matches. */
export function buildDeterministicRecommendations(
  matches: CareerMatch[],
  profile: StructuredProfile | null,
): CareerRecommendation[] {
  const userSkills = new Set(
    [...(profile?.technicalSkills ?? []), ...(profile?.softSkills ?? [])].map(norm).filter(Boolean),
  );

  const recommendations: CareerRecommendation[] = [];
  for (const match of matches) {
    const career = getCareer(match.catalogSlug);
    if (!career) continue; // defensive — every CareerMatch is produced from the catalog, this should never happen

    const enrich = getCareerEnrichment(career);
    const { minLpa, maxLpa } = getIndiaSalaryLpa(career.slug, career.salary);

    const have = career.skills.filter((skill) =>
      [...userSkills].some((u) => u.includes(norm(skill)) || norm(skill).includes(u)),
    );
    const improve = career.skills.filter((skill) => !have.includes(skill)).slice(0, 5);
    const strengths = have.length ? have.slice(0, 5) : career.skills.slice(0, 3);

    recommendations.push({
      title: career.title,
      matchPercentage: match.matchPercent,
      overview: career.whatDoes,
      whyItMatches: match.explanation,
      strengthsIdentified: strengths.length ? strengths : ["Adaptability", "Willingness to learn"],
      skillsToImprove: improve.length ? improve : career.skills.slice(0, 3),
      salaryRange: { currency: "INR", min: minLpa, max: maxLpa, period: "year" },
      industryGrowth: { outlook: career.demand, summary: enrich.futureDemandIndia },
      requiredEducation: career.education,
      recommendedCertifications: career.certifications,
      futureOpportunities: enrich.growthPath.slice(1),
    });
  }
  return recommendations;
}
