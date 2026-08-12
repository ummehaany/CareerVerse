import { cache } from "react";
import { siteConfig } from "@/config/site";
import { getUser } from "@/lib/firebase/firestore/users";
import { getPortfolio } from "@/lib/firebase/firestore/portfolio";
import { getPrimaryResume } from "@/lib/firebase/firestore/resumes";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { getInterviewAnalytics } from "@/lib/firebase/firestore/interviews";
import { getDreamState } from "@/lib/firebase/firestore/dreamCompanies";
import { getPublicProfileMeta } from "@/lib/firebase/firestore/public-profile";
import { resolveUsername } from "@/lib/firebase/firestore/username";
import { buildMemoryProfile, buildMemoryTimeline } from "@/lib/memory/service";
import { getUserAnalyticsSnapshot } from "@/features/analytics/queries";
import { evaluateAchievements, careerReadinessOf } from "@/features/analytics/engine";
import { buildUserSnapshot } from "@/features/companies/snapshot";
import { computeReadiness, pickDefaultRole } from "@/features/companies/analysis";
import { getCompanyRecord } from "@/lib/companies/catalog";
import { buildCompanyProfile } from "@/lib/companies/profile";
import { normalizeProfileSections } from "@/lib/profile/public-config";
import type { PortfolioSkill } from "@/types/portfolio";
import type { PublicProfileData, PublicSkill, PublicTargetCompany } from "./types";

/** Resolve a public username to its owner uid. */
export async function resolvePublicUid(username: string): Promise<string | null> {
  return resolveUsername(username);
}

function endorsementFor(name: string, level: string): string | undefined {
  if (level === "expert") return `Expert-level ${name} with deep, demonstrated experience.`;
  if (level === "advanced") return `Strong ${name} developer with consistent project experience.`;
  if (level === "intermediate") return `Solid, growing command of ${name}.`;
  return undefined;
}

function toPublicSkills(technical: PortfolioSkill[], soft: PortfolioSkill[], fallback: string[]): PublicSkill[] {
  const fromPortfolio = [...technical, ...soft].filter((s) => s.name?.trim());
  if (fromPortfolio.length) {
    return fromPortfolio.slice(0, 18).map((s) => ({ name: s.name, level: s.level, endorsement: endorsementFor(s.name, s.level) }));
  }
  return fallback.slice(0, 18).map((name) => ({ name, level: "intermediate", endorsement: endorsementFor(name, "intermediate") }));
}

/** Deterministic recruiter-facing summary (fallback when AI is unavailable). */
export function localProfileSummary(d: {
  name: string;
  careerGoal: string;
  roadmapPercent: number;
  roadmapExists: boolean;
  interviewCount: number;
  topSkills: string[];
  weakSkills: string[];
}): string {
  const parts: string[] = [];
  const goal = d.careerGoal && d.careerGoal !== "Not set yet" ? d.careerGoal : "their target career";
  parts.push(`${d.name} is actively preparing for ${goal} roles.`);
  if (d.roadmapExists) parts.push(`They have completed ${d.roadmapPercent}% of their learning roadmap${d.interviewCount ? ` and practiced ${d.interviewCount} mock interview${d.interviewCount === 1 ? "" : "s"}` : ""}.`);
  else if (d.interviewCount) parts.push(`They have practiced ${d.interviewCount} mock interview${d.interviewCount === 1 ? "" : "s"}.`);
  if (d.topSkills.length) parts.push(`They demonstrate strengths in ${d.topSkills.slice(0, 4).join(", ")}.`);
  if (d.weakSkills.length) parts.push(`Current focus: ${d.weakSkills.slice(0, 2).join(" and ")}.`);
  return parts.join(" ");
}

async function buildPublicProfile__impl(uid: string, isOwner: boolean): Promise<PublicProfileData | null> {
  const user = await getUser(uid);
  if (!user) return null;

  const [portfolio, resume, roadmap, interview, dream, memory, timeline, analytics, meta, userSnap] = await Promise.all([
    getPortfolio(uid).catch(() => null),
    getPrimaryResume(uid).catch(() => null),
    getLatestRoadmap(uid).catch(() => null),
    getInterviewAnalytics(uid).catch(() => ({ count: 0, averageScore: null, bestScore: null, trend: [], strongest: [], weakest: [] })),
    getDreamState(uid).catch(() => ({ saved: [], dream: [], recent: [] })),
    buildMemoryProfile(uid),
    buildMemoryTimeline(uid),
    getUserAnalyticsSnapshot(uid),
    getPublicProfileMeta(uid),
    buildUserSnapshot(uid),
  ]);

  const p = portfolio;
  const username = user.username ?? "";
  const name = (user.displayName ?? p?.personal.fullName ?? "CareerVerse Student").trim();
  const currentRole = resume?.experience?.[0]?.role?.trim() ?? "";
  const edu0 = p?.education?.[0];
  const education = edu0 ? [edu0.degree, edu0.field].filter(Boolean).join(", ") + (edu0.school ? ` · ${edu0.school}` : "") : "";

  // Achievements (unlocked).
  const achievements = evaluateAchievements(analytics)
    .filter((a) => a.unlocked)
    .map((a) => ({ id: a.id, title: a.title, description: a.description, icon: a.icon }));

  // Health breakdown.
  const healthBreakdown = [
    { key: "resume", label: "Resume", value: analytics.resumeCompletion },
    { key: "skills", label: "Skills", value: analytics.skillReadiness },
    { key: "interview", label: "Interview Readiness", value: analytics.interviewBest },
    { key: "roadmap", label: "Roadmap Progress", value: analytics.roadmapPercent },
    { key: "company", label: "Company Readiness", value: analytics.dreamReadiness },
  ];

  // Roadmap milestones.
  const completed: string[] = [];
  const upcoming: string[] = [];
  if (roadmap) {
    for (const stage of roadmap.stages) {
      for (const m of stage.milestones) {
        if (roadmap.progress?.[m.id] === "completed") completed.push(m.title);
        else upcoming.push(m.title);
      }
    }
  }

  // Target companies (reuse the Companies readiness engine).
  const targetCompanies: PublicTargetCompany[] = [];
  for (const slug of (dream.dream ?? []).slice(0, 4)) {
    const record = getCompanyRecord(slug);
    if (!record) continue;
    const profile = buildCompanyProfile(record);
    const role = pickDefaultRole(profile, userSnap);
    const r = computeReadiness(userSnap, profile, role);
    targetCompanies.push({ name: record.name, score: r.score, missing: r.missing.slice(0, 5), nextSteps: r.gapSummary });
  }

  const topSkills = memory.strongSkills.length ? memory.strongSkills : memory.skills;

  const aiSummary =
    meta.aiSummary ||
    localProfileSummary({
      name,
      careerGoal: memory.careerGoal,
      roadmapPercent: memory.roadmap.percent,
      roadmapExists: memory.roadmap.exists,
      interviewCount: interview.count,
      topSkills,
      weakSkills: memory.weakSkills,
    });

  return {
    uid,
    username,
    visibility: user.profileVisibility ?? "unlisted",
    isOwner,
    sections: normalizeProfileSections(user.profileSections),

    name,
    headline: (p?.personal.headline ?? currentRole ?? memory.careerGoal).trim() || "CareerVerse Student",
    bio: p?.personal.bio?.trim() ?? "",
    location: p?.personal.location?.trim() ?? "",
    photoUrl: p?.personal.photoUrl?.trim() || user.photoURL || null,
    education,
    currentRole,
    careerGoal: memory.careerGoal,
    dreamCompany: (p?.careerGoals.targetCompany?.trim() || memory.targetCompanies[0]) ?? "",

    healthScore: memory.careerHealthScore,
    healthBreakdown,
    aiSummary,
    skills: toPublicSkills(p?.technicalSkills ?? [], p?.softSkills ?? [], memory.skills),
    projects: (p?.projects ?? [])
      .filter((pr) => pr.name?.trim())
      .map((pr, i) => ({
        id: pr.id,
        name: pr.name,
        description: pr.description,
        technologies: pr.technologies,
        githubUrl: pr.githubUrl,
        demoUrl: pr.demoUrl,
        featured: i < 2,
      })),
    resume: {
      exists: memory.resume.exists,
      completion: memory.resume.completion,
      atsScore: memory.resume.atsScore,
      summary: resume?.summary?.trim() ?? "",
      topSkills: (resume?.skills ?? []).slice(0, 10),
      experienceCount: resume?.experience?.length ?? 0,
      lastUpdated: memory.resume.lastUpdated,
    },
    timeline,
    certifications: (p?.certifications ?? [])
      .filter((c) => c.name?.trim())
      .map((c) => ({ id: c.id, name: c.name, issuer: c.issuer, issueDate: c.issueDate, credentialUrl: c.credentialUrl })),
    interview: {
      count: interview.count,
      average: interview.averageScore,
      best: interview.bestScore,
      strong: interview.strongest ?? [],
      improve: interview.weakest ?? [],
    },
    roadmap: {
      exists: memory.roadmap.exists,
      title: memory.roadmap.title,
      percent: memory.roadmap.percent,
      milestonesDone: memory.roadmap.milestonesDone,
      milestonesTotal: memory.roadmap.milestonesTotal,
      completed: completed.slice(-6).reverse(),
      upcoming: upcoming.slice(0, 5),
    },
    targetCompanies,
    achievements,
    social: {
      linkedin: p?.social.linkedin?.trim() ?? "",
      github: p?.social.github?.trim() ?? "",
      website: p?.social.website?.trim() ?? "",
      twitter: p?.social.twitter?.trim() ?? "",
    },

    stats: isOwner ? { views: meta.views, resumeDownloads: meta.resumeDownloads, shares: meta.shares } : null,

    profileUrl: `${siteConfig.url.replace(/\/$/, "")}/u/${username}`,
    profilePath: `/u/${username}`,
  };
}

/** Request-memoized assembled public profile. */
export const buildPublicProfile = cache(buildPublicProfile__impl);


/** Minimal data for the dynamic Open Graph image (fast; no full profile build). */
export async function getPublicOgData(username: string): Promise<{ name: string; headline: string; score: number } | null> {
  const uid = await resolvePublicUid(username);
  if (!uid) return null;
  const [user, portfolio, snap] = await Promise.all([
    getUser(uid),
    getPortfolio(uid).catch(() => null),
    getUserAnalyticsSnapshot(uid),
  ]);
  if (!user || (user.profileVisibility ?? "unlisted") === "private") return null;
  return {
    name: (user.displayName ?? portfolio?.personal.fullName ?? "CareerVerse Student").trim(),
    headline: (portfolio?.personal.headline ?? "").trim(),
    score: careerReadinessOf(snap),
  };
}
