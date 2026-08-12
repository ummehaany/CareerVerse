import type { Career } from "@/lib/careers/types";
import type { StructuredProfile } from "@/types/assessment";
import type { CareerMatch, ConfidenceLevel, DimensionScores } from "./types";
import { DIMENSION_LABEL } from "./dimensions";
import { careerDimensionVector } from "./career-map";

/*
 * Recommendation engine. Scores every career by how well the user's dimension
 * profile matches what the career emphasizes, then explains the match. The
 * recommendation is generated from the whole profile — never from a single
 * answer.
 */

function confidenceFor(compatibility: number): ConfidenceLevel {
  return compatibility >= 75 ? "High" : compatibility >= 60 ? "Medium" : "Low";
}

function salaryLabel(c: Career): string {
  const k = (n: number) => `${Math.round(n / 1000)}k`;
  return `${c.salary.currency === "USD" ? "$" : ""}${k(c.salary.min)}–${k(c.salary.max)}`;
}

/** Weighted compatibility: user strength weighted by what the career demands. */
function compatibility(user: DimensionScores, vec: DimensionScores): number {
  let weighted = 0;
  let weight = 0;
  (Object.keys(vec) as (keyof DimensionScores)[]).forEach((d) => {
    const w = vec[d] / 100;
    weighted += w * (user[d] / 100);
    weight += w;
  });
  return weight ? Math.round((weighted / weight) * 100) : 0;
}

export function rankCareers(
  user: DimensionScores,
  profile: StructuredProfile,
  careers: Career[],
): CareerMatch[] {
  const userSkillText = [...profile.technicalSkills, ...profile.softSkills, ...profile.strengths]
    .join(" ")
    .toLowerCase();
  const interestText = [...profile.interests, ...profile.workActivities].map((i) => i.toLowerCase());

  const matches = careers.map((c): CareerMatch => {
    const vec = careerDimensionVector(c);
    const base = compatibility(user, vec);

    // Interest/domain overlap nudges compatibility and explains the fit.
    const careerText = `${c.category} ${c.title}`.toLowerCase();
    const matchedInterests = profile.interests.filter((i) => {
      const t = i.toLowerCase();
      return careerText.includes(t) || t.split(/\s+/).some((w) => w.length > 3 && careerText.includes(w));
    });
    const interestBonus = Math.min(12, matchedInterests.length * 4 + (interestText.some((i) => careerText.includes(i)) ? 4 : 0));
    const score = Math.min(99, base + interestBonus);

    // Driving dimensions: where the career demands a lot and the user delivers.
    const driving = (Object.keys(vec) as (keyof DimensionScores)[])
      .filter((d) => vec[d] >= 70 && user[d] >= 60)
      .sort((a, b) => user[b] - user[a])
      .slice(0, 3)
      .map((d) => DIMENSION_LABEL[d]);

    const skillsToDevelop = c.skills
      .filter((sk) => {
        const t = sk.toLowerCase();
        return !userSkillText.includes(t) && !t.split(/\s+/).some((w) => w.length > 3 && userSkillText.includes(w));
      })
      .slice(0, 4);

    const reasons: string[] = [];
    if (driving.length) reasons.push(`Your strengths in ${driving.slice(0, 2).join(" and ")} align with what this role rewards.`);
    if (matchedInterests.length) reasons.push(`It matches your interest in ${matchedInterests.slice(0, 2).join(" and ")}.`);
    if (score >= 75) reasons.push("Your overall profile is a strong fit for this path.");
    else if (score >= 60) reasons.push("A promising fit with a few skills to build.");
    else reasons.push("A stretch option worth exploring as you grow.");

    return {
      slug: c.slug,
      title: c.title,
      category: c.category,
      compatibility: score,
      confidence: confidenceFor(score),
      reasons,
      drivingDimensions: driving,
      matchedInterests,
      skillsToDevelop,
      salaryLabel: salaryLabel(c),
    };
  });

  return matches.sort((a, b) => b.compatibility - a.compatibility);
}
