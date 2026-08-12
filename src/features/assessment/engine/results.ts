import type { Answers, StructuredProfile } from "@/types/assessment";
import { getCareers } from "@/lib/careers/catalog";
import { getCompanyRecords } from "@/lib/companies/catalog";
import type { AssessmentResults, ConfidenceLevel, DimensionInsight, DreamCompanyMatch } from "./types";
import { DIMENSIONS } from "./dimensions";
import { computeDimensionScores } from "./scoring";
import { rankCareers } from "./recommend";

/*
 * Results generator. Orchestrates scoring → recommendation → narrative and
 * assembles the full, explainable results payload consumed by the results UI
 * and (later) an AI insight layer. Pure and deterministic.
 */

function clamp(n: number, lo = 0, hi = 100): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

function completenessOf(p: StructuredProfile): number {
  const checks = [
    p.interests.length > 0,
    p.technicalSkills.length > 0 || p.softSkills.length > 0,
    p.strengths.length > 0,
    p.values.length > 0,
    p.goals.targetRoles.length > 0 || Boolean(p.goals.aspiration),
    typeof p.technicalProficiency === "number",
    typeof p.communicationConfidence === "number",
    typeof p.selfMotivation === "number",
    Boolean(p.personality.socialEnergy),
    Boolean(p.workStyle.environment),
  ];
  return checks.filter(Boolean).length / checks.length;
}

function confidenceLevel(completeness: number): ConfidenceLevel {
  if (completeness >= 0.75) return "High";
  if (completeness >= 0.45) return "Medium";
  return "Low";
}

function leadershipStyle(score: number, teamRole: string | null): string {
  if (teamRole) return teamRole;
  if (score >= 72) return "Driver — you like to set direction and own outcomes";
  if (score >= 48) return "Influencer — you lead through collaboration and ideas";
  return "Specialist — you drive impact through your craft";
}

function learningStyle(prefs: string[], score: number): string {
  if (prefs.length) return prefs.slice(0, 2).join(" & ");
  return score >= 68 ? "Fast, hands-on learner" : "Steady, structured learner";
}

export function buildAssessmentResults(profile: StructuredProfile, answers?: Answers): AssessmentResults {
  const scores = computeDimensionScores(profile, answers);
  const careers = getCareers();
  const bySlug = new Map(careers.map((c) => [c.slug, c]));
  const ranked = rankCareers(scores, profile, careers);

  const topMatches = ranked.slice(0, 5);
  const alternatives = ranked.slice(5, 8);
  const primaryMatch = topMatches[0] ?? null;

  const dimensions: DimensionInsight[] = DIMENSIONS.map((d) => ({
    id: d.id,
    label: d.label,
    score: scores[d.id],
    description: d.description,
  }));
  const sortedDesc = [...dimensions].sort((a, b) => b.score - a.score);
  const topStrengths = sortedDesc.slice(0, 4);
  const growthAreas = [...dimensions].sort((a, b) => a.score - b.score).slice(0, 3);

  // Target companies aligned to the top career matches.
  const companyRecords = getCompanyRecords();
  const byName = new Map(companyRecords.map((r) => [r.name.toLowerCase(), r]));
  const dreamCompanies: DreamCompanyMatch[] = [];
  const seenCo = new Set<string>();
  for (const m of topMatches) {
    const career = bySlug.get(m.slug);
    for (const co of career?.companies ?? []) {
      const rec = byName.get(co.toLowerCase());
      if (rec && !seenCo.has(rec.slug)) {
        seenCo.add(rec.slug);
        dreamCompanies.push({ name: rec.name, slug: rec.slug, reason: `Hires for ${m.title} roles` });
      }
    }
    if (dreamCompanies.length >= 5) break;
  }

  const skillsToLearn = Array.from(new Set(topMatches.flatMap((m) => m.skillsToDevelop))).slice(0, 6);
  const certifications = Array.from(
    new Set(topMatches.flatMap((m) => (bySlug.get(m.slug)?.certifications ?? []).filter((c) => c && c !== "—"))),
  ).slice(0, 5);

  const completeness = completenessOf(profile);
  const coreAvg =
    (scores.technicalInclination + scores.analyticalThinking + scores.communication + scores.problemSolving + scores.learningStyle) / 5;
  const readinessScore = clamp(16 + (primaryMatch?.compatibility ?? 40) * 0.22 + coreAvg * 0.12, 12, 60);

  const topStrengthLabels = topStrengths.slice(0, 2).map((d) => d.label.toLowerCase());
  const summary = primaryMatch
    ? `Your profile points strongest toward ${primaryMatch.title} (${primaryMatch.compatibility}% match), powered by your ${topStrengthLabels.join(" and ")}. Below are your best-fit careers, the strengths behind them, and exactly what to build next.`
    : `We've mapped your strengths across ${DIMENSIONS.length} dimensions. Explore the careers and next steps below.`;

  return {
    summary,
    readinessScore,
    confidenceLevel: confidenceLevel(completeness),
    dimensions,
    topStrengths,
    growthAreas,
    personality: {
      socialEnergy: profile.personality.socialEnergy,
      decisionStyle: profile.personality.decisionStyle,
      structure: profile.personality.structurePreference,
    },
    workEnvironment: profile.workStyle.environment ?? "Flexible across environments",
    leadershipStyle: leadershipStyle(scores.leadership, profile.leadership.teamRole),
    learningStyle: learningStyle(profile.learningPreferences, scores.learningStyle),
    values: profile.values,
    primaryMatch,
    topMatches,
    alternatives,
    dreamCompanies,
    skillsToLearn,
    certifications,
  };
}
