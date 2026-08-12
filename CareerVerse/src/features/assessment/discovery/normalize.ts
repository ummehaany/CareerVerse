import type { Answers, StructuredProfile } from "@/types/assessment";
import type { SkillRef } from "@/types/career-profile";
import { getCareer } from "@/lib/careers/catalog";
import { BASIC_QUESTIONS, ADVANCED_QUESTIONS } from "./questions";
import type { CareerMatch, DiscoveryAnswers } from "./types";

/*
 * Bridges Career Discovery's own answer shape onto the StructuredProfile /
 * CareerProfilePatch contracts the rest of CareerVerse already reads
 * (Dashboard, Roadmap, Recommendations, Resume, Skill Gap, Compare,
 * Portfolio, Companies, Career Coach memory). Updated for the v2 question
 * set (fieldInterest, strengths, values added; primaryGoal, biggestChallenge,
 * workEnvironment removed — see questions.ts for why).
 */

const STRENGTH_LABELS: Record<string, string> = {
  analytical: "Analytical thinking",
  empathy: "Empathy",
  creativity: "Creativity",
  organization: "Organization",
  communication: "Communication",
  leadership: "Leadership",
  technical: "Technical skill",
  precision: "Attention to detail",
};

function labelFor(bank: typeof BASIC_QUESTIONS, questionId: string, value: string): string {
  const option = bank.find((q) => q.id === questionId)?.options.find((o) => o.value === value);
  return option?.label ?? value;
}

function single(answers: Answers, questionId: string): string | null {
  const value = answers[questionId];
  if (typeof value !== "string" || !value) return null;
  return labelFor(BASIC_QUESTIONS, questionId, value) ?? labelFor(ADVANCED_QUESTIONS, questionId, value);
}

function multi(answers: Answers, questionId: string): string[] {
  const value = answers[questionId];
  if (!Array.isArray(value)) return [];
  return value.map((v) => STRENGTH_LABELS[v] ?? labelFor(BASIC_QUESTIONS, questionId, v));
}

function dedupe(values: (string | null | undefined)[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  values.forEach((v) => {
    if (v && !seen.has(v)) {
      seen.add(v);
      out.push(v);
    }
  });
  return out;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Soft-skill vocabulary from the strengths question + a few advanced signals. */
function inferSoftSkills(basic: DiscoveryAnswers, advanced: DiscoveryAnswers | null): string[] {
  const skills = multi(basic, "strengths");
  if (advanced) {
    if (advanced.adv_communication_1 || advanced.adv_communication_2) skills.push("Communication");
    if (advanced.adv_leadership_1 === "take_charge" || advanced.adv_leadership_2 === "lead_win") skills.push("Leadership");
    if (advanced.adv_teamwork_1) skills.push("Teamwork");
    if (advanced.adv_adaptability_1 === "adjust_quickly" || advanced.adv_adaptability_1 === "energized_change") skills.push("Adaptability");
    if (advanced.adv_criticalThinking_1 || advanced.adv_criticalThinking_2) skills.push("Critical thinking");
  }
  if (skills.length === 0) skills.push("Communication", "Adaptability");
  return dedupe(skills);
}

export function buildDiscoveryStructuredProfile(
  basic: DiscoveryAnswers,
  advanced: DiscoveryAnswers | null,
  topMatches: CareerMatch[],
  curiosityNote?: string | null,
): StructuredProfile {
  const fieldInterest = single(basic, "fieldInterest");
  const excitingActivity = single(basic, "excitingActivity");
  const favoriteSubjects = single(basic, "favoriteSubjects");
  const problemSolvingStyle = single(basic, "problemSolvingStyle");
  const peopleOrientation = single(basic, "peopleOrientation");
  const motivation = single(basic, "motivation");
  const valuesAnswer = single(basic, "values");
  const learningStyleLabel = single(basic, "learningStyle");

  const bestMatch = topMatches[0];
  const technicalSkills = bestMatch ? (getCareer(bestMatch.catalogSlug)?.skills ?? []) : [];
  const softSkills = inferSoftSkills(basic, advanced);
  const strengths = multi(basic, "strengths");

  return {
    interests: dedupe([favoriteSubjects, excitingActivity]),
    workActivities: dedupe([problemSolvingStyle, peopleOrientation]),
    industryDirection: fieldInterest,
    education: { level: null, field: null, status: null },
    technicalSkills,
    technicalProficiency: null,
    learningAgility: null,
    softSkills,
    communicationConfidence: null,
    strengths,
    growthAreas: [],
    selfMotivation: null,
    personality: { socialEnergy: peopleOrientation, decisionStyle: problemSolvingStyle, structurePreference: null },
    workStyle: { collaboration: peopleOrientation, environment: null, pace: null },
    values: dedupe([valuesAnswer]),
    primaryMotivator: motivation,
    leadership: {
      interest: advanced?.adv_leadership_1 === "take_charge" || advanced?.adv_leadership_2 === "lead_win" ? 4 : null,
      teamRole: null,
    },
    problemSolving: { approach: problemSolvingStyle, creativity: null },
    learningPreferences: dedupe([learningStyleLabel]),
    goals: {
      horizon: null,
      targetRoles: topMatches.map((m) => m.title),
      aspiration: curiosityNote?.trim() || null,
    },
  };
}

export interface DiscoveryProfilePatch {
  education: string[];
  interests: string[];
  goals: string[];
  targetRoles: string[];
  strengths: string[];
  skills: SkillRef[];
}

export function buildDiscoveryProfilePatch(
  basic: DiscoveryAnswers,
  advanced: DiscoveryAnswers | null,
  topMatches: CareerMatch[],
  curiosityNote?: string | null,
): DiscoveryProfilePatch {
  const structured = buildDiscoveryStructuredProfile(basic, advanced, topMatches, curiosityNote);

  const technical = structured.technicalSkills.map<SkillRef>((label) => ({ skillId: slugify(label), level: 3 }));
  const soft = structured.softSkills.map<SkillRef>((label) => ({ skillId: slugify(label), level: 3 }));
  const seen = new Set<string>();
  const skills = [...technical, ...soft].filter((s) => (seen.has(s.skillId) ? false : (seen.add(s.skillId), true)));

  return {
    education: [],
    interests: structured.interests,
    goals: dedupe([structured.goals.aspiration]),
    targetRoles: structured.goals.targetRoles,
    strengths: structured.strengths,
    skills,
  };
}
