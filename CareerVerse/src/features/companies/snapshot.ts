import { cache } from "react";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getPrimaryResume } from "@/lib/firebase/firestore/resumes";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { getInterviewStats } from "@/lib/firebase/firestore/interviews";
import { listSkillAssessments } from "@/lib/firebase/firestore/skillAssessments";
import type { ResumeDoc } from "@/types/resume";
import type { RoadmapDoc } from "@/types/roadmap";
import type { UserSnapshot } from "./types";

/*
 * Assembles a serializable UserSnapshot from the user's existing CareerVerse
 * data (assessment, resume, roadmap, interviews, skill-gap). This is the single
 * integration point that ties Target Companies into the rest of the platform.
 */

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
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}

function roadmapCompletion(roadmap: RoadmapDoc | null): number {
  if (!roadmap) return 0;
  const total = roadmap.stages.reduce((sum, s) => sum + s.milestones.length, 0);
  if (total === 0) return 0;
  const done = Object.values(roadmap.progress ?? {}).filter((s) => s === "completed").length;
  return Math.round((done / total) * 100);
}

export function emptySnapshot(): UserSnapshot {
  return {
    skills: [],
    strongSkills: [],
    learningSkills: [],
    hasResume: false,
    resumeSkills: [],
    resumeSummary: "",
    resumeProjectsCount: 0,
    resumeCertsCount: 0,
    resumeExperienceCount: 0,
    resumeCompletion: 0,
    interviewBest: null,
    roadmapCompletion: 0,
    skillReadiness: null,
    targetRoles: [],
    hasProfileData: false,
  };
}

async function buildUserSnapshot__impl(uid: string): Promise<UserSnapshot> {
  const [assessment, resume, roadmap, interviews, skillAssessments] = await Promise.all([
    getLatestAssessment(uid),
    getPrimaryResume(uid),
    getLatestRoadmap(uid),
    getInterviewStats(uid),
    listSkillAssessments(uid, 1),
  ]);

  const structured = assessment?.status === "completed" ? assessment.structured : null;

  const strong = new Set<string>();
  const learning = new Set<string>();

  // Self-declared assessment skills count as known strengths.
  for (const s of structured?.technicalSkills ?? []) strong.add(s);
  for (const s of structured?.softSkills ?? []) strong.add(s);

  // Skill-gap proficiency refines this: beginner => learning, else strong.
  const latestSkillDoc = skillAssessments[0];
  for (const sk of latestSkillDoc?.skills ?? []) {
    if (sk.proficiency === "beginner") learning.add(sk.name);
    else strong.add(sk.name);
  }

  const resumeSkills = resume?.skills ?? [];
  const skills = Array.from(new Set([...strong, ...learning, ...resumeSkills]));

  const hasResume = Boolean(resume);
  const hasProfileData = skills.length > 0 || hasResume || Boolean(structured);

  return {
    skills,
    strongSkills: Array.from(strong),
    learningSkills: Array.from(learning),
    hasResume,
    resumeSkills,
    resumeSummary: resume?.summary ?? "",
    resumeProjectsCount: resume?.projects?.length ?? 0,
    resumeCertsCount: resume?.certifications?.length ?? 0,
    resumeExperienceCount: resume?.experience?.length ?? 0,
    resumeCompletion: resumeCompletion(resume),
    interviewBest: interviews.bestScore,
    roadmapCompletion: roadmapCompletion(roadmap),
    skillReadiness: latestSkillDoc?.readinessScore ?? null,
    targetRoles: structured?.goals.targetRoles ?? [],
    hasProfileData,
  };
}

/** Request-memoized: dedupes identical per-user reads within a single render (I3). */
export const buildUserSnapshot = cache(buildUserSnapshot__impl);
