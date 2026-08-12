import { verifySession } from "@/lib/firebase/auth";
import { getUser } from "@/lib/firebase/firestore/users";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getPrimaryResume } from "@/lib/firebase/firestore/resumes";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { getInterviewStats } from "@/lib/firebase/firestore/interviews";
import { listSkillAssessments } from "@/lib/firebase/firestore/skillAssessments";
import { getPortfolio } from "@/lib/firebase/firestore/portfolio";
import type { ResumeDoc } from "@/types/resume";
import type { RoadmapDoc } from "@/types/roadmap";
import { emptyPortfolio, seedPortfolio, toEditable } from "./defaults";
import type { PortfolioPageData, ProgressOverview } from "./types";

const EMPTY_PROGRESS: ProgressOverview = {
  resumeCompletion: 0,
  roadmapCompletion: 0,
  interviewPerformance: null,
  interviewCount: 0,
  skillReadiness: null,
  careerReadiness: 0,
};

/** Percent of the resume's key sections that are filled in. */
function resumeCompletion(resume: ResumeDoc | null): number {
  if (!resume) return 0;
  const c = resume.contact;
  const checks = [
    Boolean(c?.fullName?.trim()),
    Boolean(c?.headline?.trim()),
    Boolean(c?.email?.trim()),
    Boolean(resume.summary?.trim()),
    (resume.experience?.length ?? 0) > 0,
    (resume.education?.length ?? 0) > 0,
    (resume.skills?.length ?? 0) > 0,
    (resume.projects?.length ?? 0) > 0,
  ];
  const done = checks.filter(Boolean).length;
  return Math.round((done / checks.length) * 100);
}

/** Percent of roadmap milestones marked completed. */
function roadmapCompletion(roadmap: RoadmapDoc | null): number {
  if (!roadmap) return 0;
  const total = roadmap.stages.reduce((sum, s) => sum + s.milestones.length, 0);
  if (total === 0) return 0;
  const done = Object.values(roadmap.progress ?? {}).filter((s) => s === "completed").length;
  return Math.round((done / total) * 100);
}

/** One aggregate 0–100 readiness figure from every available signal. */
function careerReadiness(parts: Array<number | null>): number {
  const present = parts.filter((n): n is number => typeof n === "number");
  if (present.length === 0) return 0;
  return Math.round(present.reduce((a, b) => a + b, 0) / present.length);
}

export async function getPortfolioPageData(): Promise<PortfolioPageData> {
  const decoded = await verifySession();
  if (!decoded) {
    return {
      portfolio: emptyPortfolio(),
      progress: EMPTY_PROGRESS,
      isNew: true,
      displayName: "",
      email: "",
    };
  }
  const uid = decoded.uid;

  const [user, saved, assessment, resume, roadmap, interviews, skillAssessments] =
    await Promise.all([
      getUser(uid),
      getPortfolio(uid),
      getLatestAssessment(uid),
      getPrimaryResume(uid),
      getLatestRoadmap(uid),
      getInterviewStats(uid),
      listSkillAssessments(uid, 1),
    ]);

  const structured = assessment?.status === "completed" ? assessment.structured : null;

  const portfolio = saved
    ? toEditable(saved)
    : seedPortfolio({ user, structured, resume });

  const resumePct = resumeCompletion(resume);
  const roadmapPct = roadmapCompletion(roadmap);
  const interviewPerformance = interviews.bestScore;
  const skillReadiness = skillAssessments[0]?.readinessScore ?? null;

  const progress: ProgressOverview = {
    resumeCompletion: resumePct,
    roadmapCompletion: roadmapPct,
    interviewPerformance,
    interviewCount: interviews.count,
    skillReadiness,
    careerReadiness: careerReadiness([
      resumePct,
      roadmapPct,
      interviewPerformance,
      skillReadiness,
    ]),
  };

  return {
    portfolio,
    progress,
    isNew: !saved,
    displayName: user?.displayName ?? "",
    email: user?.email ?? "",
  };
}
