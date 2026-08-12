import { verifySession } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore/users";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { getInterviewStats } from "@/lib/firebase/firestore/interviews";
import { getGamification } from "@/lib/firebase/firestore/gamification";
import { getDreamState } from "@/lib/firebase/firestore/dreamCompanies";
import { getCompanyRecord } from "@/lib/companies/catalog";
import { buildCompanyProfile } from "@/lib/companies/profile";
import { buildUserSnapshot } from "@/features/companies/snapshot";
import { computeReadiness as computeCompanyReadiness, pickDefaultRole } from "@/features/companies/analysis";
import type { RoadmapDoc } from "@/types/roadmap";
import { assembleIntelligence } from "./engine";
import type { IntelligenceData, IntelSignals, TargetCompanyProgress } from "./types";

function firstIncompleteMilestone(roadmap: RoadmapDoc | null): { title: string; stage: string } | null {
  if (!roadmap) return null;
  for (const stage of roadmap.stages) {
    for (const m of stage.milestones) {
      if ((roadmap.progress?.[m.id] ?? "not_started") !== "completed") {
        return { title: m.title, stage: stage.title };
      }
    }
  }
  return null;
}

function emptyIntelligence(): IntelligenceData {
  return assembleIntelligence({
    onboardingComplete: false,
    hasProfileData: false,
    recommendationsCount: 0,
    topMatchTitle: null,
    hasResume: false,
    resumeCompletion: 0,
    resumeSummary: "",
    resumeExperienceCount: 0,
    resumeProjectsCount: 0,
    roadmapExists: false,
    roadmapPercent: 0,
    nextMilestone: null,
    interviewsCount: 0,
    interviewBest: null,
    skillReadiness: null,
    streak: 0,
    target: null,
  });
}

/**
 * The single cross-module read that powers dashboard intelligence and every
 * contextual recommendation. Reuses the existing aggregated getters so it stays
 * consistent with each module's own view of the data.
 */
export async function getIntelligence(): Promise<IntelligenceData> {
  const decoded = await verifySession();
  if (!decoded) return emptyIntelligence();
  const uid = decoded.uid;

  const [user, snap, roadmapDoc, recSet, interviews, gamification, dreamState] = await Promise.all([
    getUser(uid),
    buildUserSnapshot(uid),
    getLatestRoadmap(uid),
    getLatestRecommendationSet(uid),
    getInterviewStats(uid),
    getGamification(uid),
    getDreamState(uid),
  ]);

  // Target-company progress (reuses the Target Companies readiness engine).
  let target: TargetCompanyProgress | null = null;
  const targetSlug = dreamState.dream[0] ?? dreamState.saved[0] ?? null;
  const record = targetSlug ? getCompanyRecord(targetSlug) : null;
  if (record) {
    const profile = buildCompanyProfile(record);
    const role = pickDefaultRole(profile, snap);
    const readiness = computeCompanyReadiness(snap, profile, role);
    const missingSkills = [...readiness.missing, ...readiness.improve];
    const nextTask =
      readiness.missing.length > 0
        ? `Master ${readiness.missing[0]}`
        : readiness.improve.length > 0
          ? `Strengthen ${readiness.improve[0]}`
          : "Run a mock interview and polish your resume";
    target = {
      name: record.name,
      slug: record.slug,
      brand: record.brand,
      readiness: readiness.score,
      nextTask,
      missingSkills,
    };
  }

  const signals: IntelSignals = {
    onboardingComplete: user?.onboardingComplete ?? false,
    hasProfileData: snap.hasProfileData,
    recommendationsCount: recSet?.recommendations.length ?? 0,
    topMatchTitle: recSet?.recommendations?.[0]?.title ?? null,
    hasResume: snap.hasResume,
    resumeCompletion: snap.resumeCompletion,
    resumeSummary: snap.resumeSummary,
    resumeExperienceCount: snap.resumeExperienceCount,
    resumeProjectsCount: snap.resumeProjectsCount,
    roadmapExists: Boolean(roadmapDoc),
    roadmapPercent: snap.roadmapCompletion,
    nextMilestone: firstIncompleteMilestone(roadmapDoc),
    interviewsCount: interviews.count,
    interviewBest: interviews.bestScore,
    skillReadiness: snap.skillReadiness,
    streak: gamification.streak,
    target,
  };

  return assembleIntelligence(signals);
}
