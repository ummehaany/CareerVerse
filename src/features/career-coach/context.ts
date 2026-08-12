import { getUser } from "@/lib/firebase/firestore/users";
import { resolveCareerField } from "@/features/onboarding/flow-config";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { getDreamState } from "@/lib/firebase/firestore/dreamCompanies";
import { getCompanyRecord } from "@/lib/companies/catalog";
import { buildCompanyProfile } from "@/lib/companies/profile";
import { buildUserSnapshot } from "@/features/companies/snapshot";
import { computeReadiness, pickDefaultRole } from "@/features/companies/analysis";
import type { RoadmapDoc } from "@/types/roadmap";
import type { CoachContext } from "./types";

function firstNameOf(displayName: string | null, email: string | null): string {
  return displayName?.split(" ")[0] ?? email?.split("@")[0] ?? "there";
}

function nextMilestoneOf(roadmap: RoadmapDoc | null): string | null {
  if (!roadmap) return null;
  for (const stage of roadmap.stages) {
    for (const m of stage.milestones) {
      if ((roadmap.progress?.[m.id] ?? "not_started") !== "completed") return m.title;
    }
  }
  return null;
}

function avg(parts: Array<number | null>): number {
  const present = parts.filter((n): n is number => typeof n === "number" && n > 0);
  if (!present.length) return 0;
  return Math.round(present.reduce((a, b) => a + b, 0) / present.length);
}

/** Build the coach's view of the user by aggregating every CareerVerse module. */
export async function buildCoachContext(uid: string): Promise<CoachContext> {
  const [user, snapshot, recs, roadmapDoc, dreamState] = await Promise.all([
    getUser(uid),
    buildUserSnapshot(uid),
    getLatestRecommendationSet(uid),
    getLatestRoadmap(uid),
    getDreamState(uid),
  ]);

  const firstName = firstNameOf(user?.displayName ?? null, user?.email ?? null);

  // Only surface onboarding as context when the student actually answered
  // something (skipped onboarding leaves every field null). "Not sure yet"
  // resolves to null here, same as never having answered — it's real context
  // (they answered) but never displayed as if it were a field name.
  const ob = user?.onboarding;
  const obCareerField = resolveCareerField(ob?.careerField);
  const onboarding =
    ob && (ob.careerGoal || obCareerField || ob.currentLevel)
      ? { careerGoal: ob.careerGoal, careerField: obCareerField, currentLevel: ob.currentLevel }
      : null;

  const topMatch = recs?.recommendations?.[0];
  const careerMatch = topMatch ? { title: topMatch.title, fit: topMatch.matchPercentage } : null;

  // Target-company readiness (reuses the Target Companies engine).
  let dreamCompany: CoachContext["dreamCompany"] = null;
  let missingSkills: string[] = snapshot.learningSkills;
  let strongSkills: string[] = snapshot.strongSkills;

  const dreamSlug = dreamState.dream[0];
  const dreamRecord = dreamSlug ? getCompanyRecord(dreamSlug) : null;
  if (dreamRecord) {
    const profile = buildCompanyProfile(dreamRecord);
    const role = pickDefaultRole(profile, snapshot);
    const readiness = computeReadiness(snapshot, profile, role);
    dreamCompany = {
      name: dreamRecord.name,
      slug: dreamRecord.slug,
      readiness: readiness.score,
      roleTitle: readiness.roleTitle,
      prepTime: readiness.prepTime,
    };
    if (readiness.missing.length) missingSkills = readiness.missing;
    if (readiness.strong.length) strongSkills = readiness.strong;
  }

  const roadmap = roadmapDoc
    ? { title: roadmapDoc.careerTitle, percent: snapshot.roadmapCompletion }
    : null;

  const careerReadiness = avg([
    snapshot.skillReadiness,
    snapshot.resumeCompletion,
    snapshot.roadmapCompletion,
    snapshot.interviewBest,
    dreamCompany?.readiness ?? null,
  ]);

  return {
    firstName,
    hasData: snapshot.hasProfileData,
    careerMatch,
    dreamCompany,
    hasResume: snapshot.hasResume,
    resumeCompletion: snapshot.resumeCompletion,
    roadmap,
    nextMilestone: nextMilestoneOf(roadmapDoc),
    skillReadiness: snapshot.skillReadiness,
    careerReadiness,
    strongestSkill: strongSkills[0] ?? null,
    biggestGap: missingSkills[0] ?? null,
    strongSkills,
    missingSkills,
    interviewBest: snapshot.interviewBest,
    targetRoles: snapshot.targetRoles,
    onboarding,
  };
}
