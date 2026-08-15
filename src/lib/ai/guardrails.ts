import { AIError } from "./types";
import type { StructuredProfile } from "@/types/assessment";
import type { CareerRecommendation } from "@/types/recommendation";

/** Ensure there's enough signal in the profile to produce grounded output. */
export function guardProfile(profile: StructuredProfile): void {
  const hasSignal =
    profile.interests.length > 0 ||
    profile.technicalSkills.length > 0 ||
    profile.strengths.length > 0 ||
    profile.values.length > 0;

  if (!hasSignal) {
    throw new AIError(
      "There isn't enough assessment data to generate recommendations.",
      "insufficient_input",
    );
  }
}

export function dedupeTrim(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const clean = value.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(clean);
  }
  return result;
}

/**
 * Normalize model output before persistence: clamp match scores, trim/dedupe
 * lists, cap to five, and sort by match percentage descending.
 */
export function sanitizeRecommendations(recommendations: CareerRecommendation[]): CareerRecommendation[] {
  return recommendations
    .slice(0, 5)
    .map((rec) => ({
      ...rec,
      title: rec.title.trim(),
      matchPercentage: Math.max(0, Math.min(100, Math.round(rec.matchPercentage))),
      overview: rec.overview.trim(),
      whyItMatches: rec.whyItMatches.trim(),
      requiredEducation: rec.requiredEducation.trim(),
      strengthsIdentified: dedupeTrim(rec.strengthsIdentified),
      skillsToImprove: dedupeTrim(rec.skillsToImprove),
      recommendedCertifications: dedupeTrim(rec.recommendedCertifications),
      futureOpportunities: dedupeTrim(rec.futureOpportunities),
      salaryRange: {
        ...rec.salaryRange,
        currency: rec.salaryRange.currency.trim().toUpperCase() || "USD",
        min: Math.max(0, Math.round(rec.salaryRange.min)),
        max: Math.max(0, Math.round(rec.salaryRange.max)),
        period: rec.salaryRange.period.trim() || "year",
      },
    }))
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}
