import type { Answers, StructuredProfile } from "@/types/assessment";
import type { SkillRef } from "@/types/career-profile";
import { QUESTIONS_BY_ID } from "./questions";

function labelFor(questionId: string, value: string): string {
  const option = QUESTIONS_BY_ID[questionId]?.options?.find((o) => o.value === value);
  return option?.label ?? value;
}

function single(answers: Answers, questionId: string): string | null {
  const value = answers[questionId];
  return typeof value === "string" && value ? labelFor(questionId, value) : null;
}

function multi(answers: Answers, questionId: string): string[] {
  const value = answers[questionId];
  return Array.isArray(value) ? value.map((v) => labelFor(questionId, v)) : [];
}

function scale(answers: Answers, questionId: string): number | null {
  const value = answers[questionId];
  return typeof value === "number" ? value : null;
}

function text(answers: Answers, questionId: string): string | null {
  const value = answers[questionId];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

/**
 * Deterministically project the raw answers into the AI-ready structure. No AI
 * is involved — this simply organizes the user's own responses for later
 * consumption by the Phase 4 engine.
 */
export function buildStructuredProfile(answers: Answers): StructuredProfile {
  return {
    interests: multi(answers, "interestAreas"),
    workActivities: multi(answers, "workActivities"),
    industryDirection: single(answers, "industryDirection"),
    education: {
      level: single(answers, "educationLevel"),
      field: single(answers, "fieldOfStudy"),
      status: single(answers, "currentStatus"),
    },
    technicalSkills: multi(answers, "technicalSkills"),
    technicalProficiency: scale(answers, "technicalProficiency"),
    learningAgility: scale(answers, "learningAgility"),
    softSkills: multi(answers, "softSkills"),
    communicationConfidence: scale(answers, "communicationConfidence"),
    strengths: multi(answers, "topStrengths"),
    growthAreas: multi(answers, "growthAreas"),
    selfMotivation: scale(answers, "selfMotivation"),
    personality: {
      socialEnergy: single(answers, "socialEnergy"),
      decisionStyle: single(answers, "decisionStyle"),
      structurePreference: single(answers, "structurePreference"),
    },
    workStyle: {
      collaboration: single(answers, "collaborationStyle"),
      environment: single(answers, "workEnvironment"),
      pace: single(answers, "workPace"),
    },
    values: multi(answers, "careerValues"),
    primaryMotivator: single(answers, "primaryMotivator"),
    leadership: {
      interest: scale(answers, "leadershipInterest"),
      teamRole: single(answers, "teamRole"),
    },
    problemSolving: {
      approach: single(answers, "problemSolvingApproach"),
      creativity: scale(answers, "creativityLevel"),
    },
    learningPreferences: multi(answers, "learningPreferences"),
    goals: {
      horizon: single(answers, "goalHorizon"),
      targetRoles: multi(answers, "targetRoles"),
      aspiration: text(answers, "careerAspiration"),
    },
  };
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export interface ProfilePatch {
  education: string[];
  interests: string[];
  goals: string[];
  targetRoles: string[];
  strengths: string[];
  skills: SkillRef[];
}

/**
 * Map the direct (non-AI) answers onto the shared `careerProfiles/{uid}`
 * document so the dashboard reflects real data. AI-derived fields (aiSummary,
 * matched roles) remain untouched and are filled by a later phase.
 */
export function buildProfilePatch(answers: Answers): ProfilePatch {
  const educationLevel = single(answers, "educationLevel");
  const fieldOfStudy = single(answers, "fieldOfStudy");
  const education = [educationLevel, fieldOfStudy].filter((v): v is string => Boolean(v));

  const goalHorizon = single(answers, "goalHorizon");
  const aspiration = text(answers, "careerAspiration");
  const goals = [goalHorizon, aspiration].filter((v): v is string => Boolean(v));

  const techLevel = scale(answers, "technicalProficiency") ?? 3;
  const commLevel = scale(answers, "communicationConfidence") ?? 3;
  const technical = multi(answers, "technicalSkills").map<SkillRef>((label) => ({
    skillId: slugify(label),
    level: techLevel,
  }));
  const soft = multi(answers, "softSkills").map<SkillRef>((label) => ({
    skillId: slugify(label),
    level: commLevel,
  }));
  const skills = dedupeSkills([...technical, ...soft]);

  return {
    education,
    interests: multi(answers, "interestAreas"),
    goals,
    targetRoles: multi(answers, "targetRoles"),
    strengths: multi(answers, "topStrengths"),
    skills,
  };
}

function dedupeSkills(skills: SkillRef[]): SkillRef[] {
  const seen = new Set<string>();
  const result: SkillRef[] = [];
  for (const skill of skills) {
    if (seen.has(skill.skillId)) continue;
    seen.add(skill.skillId);
    result.push(skill);
  }
  return result;
}
