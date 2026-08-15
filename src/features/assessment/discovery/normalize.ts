import type { Answers, StructuredProfile } from "@/types/assessment";
import type { SkillRef } from "@/types/career-profile";
import { getCareer } from "@/lib/careers/catalog";
import { BASIC_QUESTIONS, ADVANCED_QUESTIONS } from "./questions";
import type { CareerMatch, DiscoveryAnswers } from "./types";

/*
 * Bridges Career Discovery's own answer shape onto the StructuredProfile /
 * CareerProfilePatch contracts the rest of CareerVerse already reads
 * (Dashboard, Roadmap, Recommendations, Resume, Skill Gap, Compare,
 * Portfolio, Companies, Career Coach memory). Updated for the v3 question
 * set (educationLevel through goalHorizon added to the mandatory Core tier
 * so education/technicalProficiency/learningAgility/communicationConfidence/
 * growthAreas/workStyle/structurePreference/goals.horizon are no longer
 * always null; leadership.teamRole/problemSolving.creativity/selfMotivation
 * are derived from existing advanced answers once that optional tier is
 * complete — see questions.ts for why).
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

const GROWTH_LABELS: Record<string, string> = {
  analytical: "Analytical thinking",
  empathy: "Empathy",
  creativity: "Creativity",
  organization: "Organization",
  communication: "Communication",
  leadership: "Leadership",
  technical: "Technical skill",
  business: "Business & strategic thinking",
};

/** `goalHorizon` doubles as a light-touch proxy for "current status" — there's
 * no separate status question in Career Discovery, and these map cleanly. */
const STATUS_FROM_GOAL_HORIZON: Record<string, string> = {
  exploring_options: "Exploring options",
  building_foundational_skills: "Studying / building skills",
  launching_a_career: "Job seeking",
  advancing_or_switching: "Employed",
};

const TEAM_ROLE_FROM_LEADERSHIP: Record<string, string> = {
  take_charge: "Leader",
  support_leader: "Supporter",
  own_piece: "Individual contributor",
  mediate: "Mediator",
};

function numberAnswer(answers: Answers, questionId: string): number | null {
  const value = answers[questionId];
  if (typeof value !== "string") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

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

function multiGrowth(answers: Answers, questionId: string): string[] {
  const value = answers[questionId];
  if (!Array.isArray(value)) return [];
  return value.map((v) => GROWTH_LABELS[v] ?? labelFor(BASIC_QUESTIONS, questionId, v));
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

  // v3 Core-tier additions (educationLevel → goalHorizon) — see questions.ts
  // for why these exist: real scoring weight + they fill in StructuredProfile
  // fields that were previously always null for every Discovery user.
  const educationLevelLabel = single(basic, "educationLevel");
  const fieldOfStudyRaw = basic.fieldOfStudyOrWork;
  const fieldOfStudyLabel = fieldOfStudyRaw === "not_sure" ? null : single(basic, "fieldOfStudyOrWork");
  const goalHorizonAnswer = typeof basic.goalHorizon === "string" ? basic.goalHorizon : null;
  const goalHorizonLabel = single(basic, "goalHorizon");
  const structurePreferenceLabel = single(basic, "structurePreference");
  const workEnvironmentLabel = single(basic, "workEnvironmentPreference");
  const workPaceLabel = single(basic, "workPace");
  const growthAreas = multiGrowth(basic, "growthAreas");

  const bestMatch = topMatches[0];
  const technicalSkills = bestMatch ? (getCareer(bestMatch.catalogSlug)?.skills ?? []) : [];
  const softSkills = inferSoftSkills(basic, advanced);
  const strengths = multi(basic, "strengths");

  // Only populated once the optional advanced tier is complete — these
  // questions live in ADVANCED_QUESTIONS, not the mandatory Core 20.
  const leadershipTeamRole =
    advanced && typeof advanced.adv_leadership_1 === "string"
      ? (TEAM_ROLE_FROM_LEADERSHIP[advanced.adv_leadership_1] ?? null)
      : null;
  const creativeAdvancedChoices = advanced
    ? [advanced.adv_creativity_1, advanced.adv_creativity_2].filter(
        (v) => v === "designing_visually" || v === "sketch_prototype" || v === "new_idea",
      ).length
    : 0;
  const problemSolvingCreativity = advanced ? Math.min(5, 2 + creativeAdvancedChoices) : null;
  const selfMotivationFromAdvanced: Record<string, number> = {
    stays_high: 5,
    needs_structure: 3,
    depends_project: 3,
    drops_accountability: 2,
  };
  const selfMotivation =
    advanced && typeof advanced.adv_selfManagement_1 === "string"
      ? (selfMotivationFromAdvanced[advanced.adv_selfManagement_1] ?? null)
      : null;

  return {
    interests: dedupe([favoriteSubjects, excitingActivity]),
    workActivities: dedupe([problemSolvingStyle, peopleOrientation]),
    industryDirection: fieldInterest,
    education: {
      level: educationLevelLabel,
      field: fieldOfStudyLabel,
      status: goalHorizonAnswer ? (STATUS_FROM_GOAL_HORIZON[goalHorizonAnswer] ?? null) : null,
    },
    technicalSkills,
    technicalProficiency: numberAnswer(basic, "technicalConfidence"),
    learningAgility: numberAnswer(basic, "learningAgilityLevel"),
    softSkills,
    communicationConfidence: numberAnswer(basic, "communicationConfidenceLevel"),
    strengths,
    growthAreas,
    selfMotivation,
    personality: {
      socialEnergy: peopleOrientation,
      decisionStyle: problemSolvingStyle,
      structurePreference: structurePreferenceLabel,
    },
    workStyle: { collaboration: peopleOrientation, environment: workEnvironmentLabel, pace: workPaceLabel },
    values: dedupe([valuesAnswer]),
    primaryMotivator: motivation,
    leadership: {
      interest: advanced?.adv_leadership_1 === "take_charge" || advanced?.adv_leadership_2 === "lead_win" ? 4 : null,
      teamRole: leadershipTeamRole,
    },
    problemSolving: { approach: problemSolvingStyle, creativity: problemSolvingCreativity },
    learningPreferences: dedupe([learningStyleLabel]),
    goals: {
      horizon: goalHorizonLabel,
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
