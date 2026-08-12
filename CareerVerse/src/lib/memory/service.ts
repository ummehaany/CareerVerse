import { cache } from "react";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getPrimaryResume } from "@/lib/firebase/firestore/resumes";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { listRecentInterviews } from "@/lib/firebase/firestore/interviews";
import { getDreamState } from "@/lib/firebase/firestore/dreamCompanies";
import { getMemoryAugment } from "@/lib/firebase/firestore/memory";
import { getUser } from "@/lib/firebase/firestore/users";
import { resolveCareerField } from "@/features/onboarding/flow-config";
import { buildUserSnapshot } from "@/features/companies/snapshot";
import { getUserAnalyticsSnapshot } from "@/features/analytics/queries";
import { careerReadinessOf } from "@/features/analytics/engine";
import { getCompanyRecord } from "@/lib/companies/catalog";
import { computeAtsScore } from "@/features/resume/ats";
import type { ResumeData } from "@/types/resume";
import type { FirestoreTimestamp } from "@/types/user";
import type { MemoryEvent, MemoryProfile } from "@/lib/memory/types";

/**
 * Memory RETRIEVAL. Assembles a read-only MemoryProfile by aggregating the
 * user's existing CareerVerse data (single source of truth) and layering the
 * persisted augment (overrides, learning style, notes, FAQs, recommendations).
 * All underlying getters are request-memoized, so this is cheap to call more
 * than once per request.
 */

function tsToIso(ts: FirestoreTimestamp | null | undefined): string | null {
  try {
    return ts ? ts.toDate().toISOString() : null;
  } catch {
    return null;
  }
}

function uniq(list: string[]): string[] {
  return Array.from(new Set(list.map((s) => s.trim()).filter(Boolean)));
}

async function buildMemoryProfile__impl(uid: string): Promise<MemoryProfile> {
  const [analytics, snap, assessment, resume, roadmap, dream, augment, user] = await Promise.all([
    getUserAnalyticsSnapshot(uid),
    buildUserSnapshot(uid),
    getLatestAssessment(uid).catch(() => null),
    getPrimaryResume(uid).catch(() => null),
    getLatestRoadmap(uid).catch(() => null),
    getDreamState(uid).catch(() => ({ saved: [], dream: [], recent: [] })),
    getMemoryAugment(uid),
    getUser(uid).catch(() => null),
  ]);

  const structured = assessment?.status === "completed" ? assessment.structured : null;
  const overrides = augment.overrides ?? {};
  const onboarding = user?.onboarding;

  // Target companies: user override first, then saved "dream" companies
  // (names), then whatever the first-run onboarding answer named directly —
  // covers accounts onboarded before dream-company seeding existed.
  const dreamNames = (dream.dream ?? [])
    .map((slug) => getCompanyRecord(slug)?.name ?? null)
    .filter((n): n is string => Boolean(n));
  const targetCompanies = uniq([
    overrides.targetCompany ?? "",
    ...dreamNames,
    ...(onboarding?.targetCompanies ?? []),
  ]);

  const targetRole = (snap.targetRoles?.[0] ?? structured?.goals?.targetRoles?.[0] ?? "").trim();

  // Onboarding's goal + field as a last-resort fallback — used only until
  // Career Discovery (the authoritative source) has something more specific.
  // resolveCareerField turns "Not sure yet" into null so it's simply omitted
  // here rather than joined in as literal text.
  const onboardingGoal = [onboarding?.careerGoal, resolveCareerField(onboarding?.careerField)]
    .filter((v): v is string => Boolean(v))
    .join(" in ");

  const careerGoal =
    (overrides.careerGoal ?? "").trim() ||
    (structured?.goals?.aspiration ?? "").trim() ||
    targetRole ||
    onboardingGoal ||
    "Not set yet";

  const certifications = uniq((resume?.certifications ?? []).map((c) => c.name));
  const projects = uniq((resume?.projects ?? []).map((p) => p.name));

  const atsScore = resume ? computeAtsScore(resume as ResumeData).score : null;

  const milestonesTotal = roadmap ? roadmap.stages.reduce((sum, s) => sum + s.milestones.length, 0) : 0;

  const healthScore = careerReadinessOf(analytics);

  const learningStyle = overrides.learningStyle ?? "unset";

  return {
    uid,
    careerGoal,
    targetCompanies,
    targetRole,
    assessmentCompleted: Boolean(structured),
    assessmentSummary: (structured?.goals?.aspiration ?? "").trim() || null,
    skills: uniq(snap.skills).slice(0, 40),
    strongSkills: uniq(snap.strongSkills).slice(0, 30),
    weakSkills: uniq(snap.learningSkills).slice(0, 30),
    certifications,
    projects,
    resume: {
      exists: snap.hasResume,
      completion: snap.resumeCompletion,
      atsScore,
      lastUpdated: tsToIso(resume?.updatedAt),
    },
    roadmap: {
      exists: analytics.roadmapExists,
      title: roadmap?.careerTitle ?? null,
      percent: analytics.roadmapPercent,
      milestonesDone: analytics.roadmapMilestonesDone,
      milestonesTotal,
    },
    interview: {
      count: analytics.interviewsCount,
      best: analytics.interviewBest,
      avg: analytics.interviewAvg,
    },
    careerHealthScore: healthScore,
    streak: analytics.streak,
    longestStreak: analytics.longestStreak,
    learningStyle,
    faqs: augment.faqs,
    recommendations: augment.recommendations,
    weeklySummaries: augment.weeklySnapshots,
    notes: augment.notes,
    hiddenFields: augment.hiddenFields,
  };
}

/** Request-memoized assembled memory profile. */
export const buildMemoryProfile = cache(buildMemoryProfile__impl);

/* ── Timeline ───────────────────────────────────────────────────────────────*/

function keyOf(e: MemoryEvent): string {
  return `${e.type}|${e.title}|${e.at.slice(0, 10)}`;
}

/**
 * Chronological career timeline: current-state derived events (backfill) merged
 * with stored events (accurate going forward), de-duplicated and capped.
 */
async function buildMemoryTimeline__impl(uid: string): Promise<MemoryEvent[]> {
  const [augment, assessment, resume, roadmap, interviews] = await Promise.all([
    getMemoryAugment(uid),
    getLatestAssessment(uid).catch(() => null),
    getPrimaryResume(uid).catch(() => null),
    getLatestRoadmap(uid).catch(() => null),
    listRecentInterviews(uid, 8).catch(() => []),
  ]);

  const derived: MemoryEvent[] = [];
  const push = (e: Omit<MemoryEvent, "id" | "source">) =>
    derived.push({ ...e, id: `d:${e.type}:${e.at}`, source: "derived" });

  const assessmentTs = tsToIso((assessment as { completedAt?: FirestoreTimestamp; updatedAt?: FirestoreTimestamp } | null)?.completedAt) ??
    tsToIso((assessment as { updatedAt?: FirestoreTimestamp } | null)?.updatedAt);
  if (assessment?.status === "completed" && assessmentTs) {
    push({ type: "assessment", title: "Career assessment completed", at: assessmentTs });
  }

  const resumeTs = tsToIso(resume?.updatedAt);
  if (resume && resumeTs) {
    push({ type: "resume", title: "Resume updated", detail: `${computeAtsScore(resume as ResumeData).score} ATS score`, at: resumeTs });
    for (const c of resume.certifications ?? []) {
      if (c.name?.trim()) push({ type: "certification", title: `Certification: ${c.name.trim()}`, at: resumeTs });
    }
  }

  const roadmapTs = tsToIso((roadmap as { updatedAt?: FirestoreTimestamp; createdAt?: FirestoreTimestamp } | null)?.updatedAt) ??
    tsToIso((roadmap as { createdAt?: FirestoreTimestamp } | null)?.createdAt);
  if (roadmap && roadmapTs) {
    const done = Object.values(roadmap.progress ?? {}).filter((s) => s === "completed").length;
    push({ type: "roadmap", title: `Roadmap: ${roadmap.careerTitle}`, detail: done > 0 ? `${done} milestone${done === 1 ? "" : "s"} completed` : "Roadmap generated", at: roadmapTs });
  }

  for (const iv of interviews) {
    const at = tsToIso((iv as { createdAt?: FirestoreTimestamp }).createdAt);
    if (!at) continue;
    const score = iv.evaluation?.overallScore ?? null;
    push({ type: "interview", title: `Mock interview: ${iv.role}`, detail: score != null ? `Scored ${score}/100` : undefined, at, score });
  }

  for (const w of augment.weeklySnapshots) {
    push({ type: "healthScore", title: `Career Health Score: ${w.healthScore}`, detail: w.summary, at: w.at });
  }
  for (const n of augment.notes) {
    push({ type: "note", title: n.text.slice(0, 80), at: n.createdAt });
  }

  // Merge stored (authoritative) + derived, de-dupe, newest first.
  const seen = new Set<string>();
  const merged: MemoryEvent[] = [];
  for (const e of [...augment.events, ...derived]) {
    const k = keyOf(e);
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(e);
  }
  merged.sort((a, b) => (a.at < b.at ? 1 : a.at > b.at ? -1 : 0));
  return merged.slice(0, 30);
}

export const buildMemoryTimeline = cache(buildMemoryTimeline__impl);
