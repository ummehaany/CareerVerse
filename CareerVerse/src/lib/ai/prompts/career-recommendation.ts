import type { StructuredProfile } from "@/types/assessment";

/** Version the prompt so stored output stays interpretable over time. */
export const RECOMMENDATION_PROMPT_VERSION = 1;

export function buildRecommendationSystemPrompt(): string {
  return [
    "You are an expert career counselor and labor-market analyst.",
    "You analyze a person's self-reported career assessment and recommend the five careers that fit them best.",
    "",
    "Rules:",
    "- Return EXACTLY five recommendations, ordered from best to worst fit.",
    "- Ground every recommendation strictly in the provided profile. Do not invent facts about the person.",
    "- matchPercentage is an integer 0–100 that reflects genuine fit; vary the values realistically (do not give everything the same score).",
    "- 'whyItMatches' must reference specific signals from the profile (interests, skills, strengths, values, work style).",
    "- 'strengthsIdentified' are the person's existing strengths that support this path.",
    "- 'skillsToImprove' are concrete, actionable gaps to close for this path.",
    "- salaryRange is a realistic annual range for a typical practitioner; use USD unless the profile clearly implies another region. Use plain integers (no separators).",
    "- industryGrowth.outlook is a short label (e.g. 'Strong', 'Above average', 'Stable', 'Cooling'); industryGrowth.summary is one sentence.",
    "- requiredEducation is the typical education path; recommendedCertifications are widely recognized, real certifications (or an empty list if none apply).",
    "- futureOpportunities lists concrete roles or directions this path can lead to.",
    "- Be specific, realistic, and encouraging. Avoid hype and avoid generic filler.",
    "- Output ONLY JSON that conforms to the provided schema. No prose, no markdown.",
  ].join("\n");
}

function list(label: string, values: string[]): string | null {
  return values.length ? `${label}: ${values.join(", ")}` : null;
}

function scale(label: string, value: number | null): string | null {
  return value === null ? null : `${label}: ${value}/5`;
}

function cap(text: string | null, max = 500): string | null {
  if (!text) return null;
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

export function buildRecommendationUserPrompt(
  profile: StructuredProfile,
  displayName?: string | null,
): string {
  const lines: Array<string | null> = [
    displayName ? `Candidate: ${displayName}` : null,
    "",
    "== Interests ==",
    list("Interest areas", profile.interests),
    list("Energizing activities", profile.workActivities),
    profile.industryDirection ? `Preferred direction: ${profile.industryDirection}` : null,
    "",
    "== Education & status ==",
    profile.education.level ? `Education level: ${profile.education.level}` : null,
    profile.education.field ? `Field of study: ${profile.education.field}` : null,
    profile.education.status ? `Current status: ${profile.education.status}` : null,
    "",
    "== Skills ==",
    list("Technical skills", profile.technicalSkills),
    scale("Technical confidence", profile.technicalProficiency),
    scale("Learning agility", profile.learningAgility),
    list("Soft skills", profile.softSkills),
    scale("Communication confidence", profile.communicationConfidence),
    "",
    "== Strengths & growth ==",
    list("Strengths", profile.strengths),
    list("Growth areas", profile.growthAreas),
    scale("Self-motivation", profile.selfMotivation),
    "",
    "== Personality & work style ==",
    profile.personality.socialEnergy ? `Social energy: ${profile.personality.socialEnergy}` : null,
    profile.personality.decisionStyle ? `Decision style: ${profile.personality.decisionStyle}` : null,
    profile.personality.structurePreference
      ? `Structure preference: ${profile.personality.structurePreference}`
      : null,
    profile.workStyle.collaboration ? `Collaboration: ${profile.workStyle.collaboration}` : null,
    profile.workStyle.environment ? `Environment: ${profile.workStyle.environment}` : null,
    profile.workStyle.pace ? `Pace: ${profile.workStyle.pace}` : null,
    "",
    "== Values & motivation ==",
    list("Career values", profile.values),
    profile.primaryMotivator ? `Primary motivator: ${profile.primaryMotivator}` : null,
    "",
    "== Leadership & problem-solving ==",
    scale("Leadership interest", profile.leadership.interest),
    profile.leadership.teamRole ? `Natural team role: ${profile.leadership.teamRole}` : null,
    profile.problemSolving.approach ? `Problem-solving approach: ${profile.problemSolving.approach}` : null,
    scale("Creativity preference", profile.problemSolving.creativity),
    "",
    "== Learning & goals ==",
    list("Learning preferences", profile.learningPreferences),
    profile.goals.horizon ? `Focus: ${profile.goals.horizon}` : null,
    list("Target roles of interest", profile.goals.targetRoles),
    cap(profile.goals.aspiration) ? `Aspiration: ${cap(profile.goals.aspiration)}` : null,
    "",
    "Recommend the five best-fitting careers for this person as JSON.",
  ];

  return lines.filter((line) => line !== null).join("\n");
}
