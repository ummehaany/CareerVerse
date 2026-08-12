import type { StructuredProfile } from "@/types/assessment";

/** Version the prompt so stored output stays interpretable over time. */
export const ROADMAP_PROMPT_VERSION = 1;

export function buildRoadmapSystemPrompt(): string {
  return [
    "You are an expert learning architect and career coach.",
    "You design personalized, practical learning roadmaps that take someone from their current level to job-ready in a target career.",
    "",
    "Rules:",
    "- Produce EXACTLY three stages, in this order: beginner, intermediate, advanced.",
    "- Each stage has a short title, a one-sentence summary, an estimatedTime, and 2–4 milestones.",
    "- Each milestone is a concrete learning objective with: a title, a description, the skills it builds, an estimatedTime (e.g. '2–3 weeks'), 1–3 hands-on projects, relevant real certifications (or an empty list), and a few learning resources (types or well-known resource names).",
    "- Calibrate the starting point to the learner's current skills and confidence — do not make an experienced learner start from absolute zero, and do not overwhelm a beginner.",
    "- Be realistic about time. totalEstimatedTime should reflect the sum of the stages.",
    "- Recommend real, widely-recognized certifications only when they genuinely apply.",
    "- Projects must be specific and portfolio-worthy, not vague.",
    "- Output ONLY JSON that conforms to the provided schema. No prose, no markdown.",
  ].join("\n");
}

function list(label: string, values: string[]): string | null {
  return values.length ? `${label}: ${values.join(", ")}` : null;
}

function scale(label: string, value: number | null): string | null {
  return value === null ? null : `${label}: ${value}/5`;
}

export function buildRoadmapUserPrompt(careerTitle: string, profile: StructuredProfile): string {
  const lines: Array<string | null> = [
    `Target career: ${careerTitle}`,
    "",
    "Learner profile:",
    profile.education.level ? `Education level: ${profile.education.level}` : null,
    profile.education.field ? `Field of study: ${profile.education.field}` : null,
    profile.education.status ? `Current status: ${profile.education.status}` : null,
    list("Existing technical skills", profile.technicalSkills),
    scale("Technical confidence", profile.technicalProficiency),
    scale("Learning agility", profile.learningAgility),
    list("Soft skills", profile.softSkills),
    list("Strengths", profile.strengths),
    list("Growth areas", profile.growthAreas),
    list("Preferred ways to learn", profile.learningPreferences),
    profile.goals.horizon ? `Current focus: ${profile.goals.horizon}` : null,
    "",
    `Design a beginner → intermediate → advanced roadmap that gets this learner job-ready as a ${careerTitle}. Return JSON.`,
  ];

  return lines.filter((line) => line !== null).join("\n");
}
