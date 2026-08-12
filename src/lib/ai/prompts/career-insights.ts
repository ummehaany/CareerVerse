import type { Career } from "@/lib/careers/types";

export const CAREER_INSIGHTS_PROMPT_VERSION = 1;

export function buildCareerInsightsSystemPrompt(): string {
  return [
    "You are a career expert writing concise, practical insights about a profession.",
    "",
    "Rules:",
    "- 'dayInLife' is a vivid 2–4 sentence narrative of a typical day in this role.",
    "- 'insights' are 3–5 sharp, non-obvious observations or tips about succeeding in this career.",
    "- 'recommendedProjects' are 3–4 concrete, portfolio-worthy projects to build relevant skills.",
    "- 'learningPath' is 3–4 ordered steps (each a short stage + focus) to enter this field.",
    "- 'outlook' is a 1–2 sentence honest take on future demand and how the role is evolving.",
    "- Be specific and realistic. No hype, no filler.",
    "- Output ONLY JSON conforming to the schema. No markdown.",
  ].join("\n");
}

export function buildCareerInsightsUserPrompt(career: Career): string {
  return [
    `Career: ${career.title}`,
    `Category: ${career.category}`,
    `What it does: ${career.whatDoes}`,
    `Key skills: ${career.skills.join(", ")}`,
    `Typical education: ${career.education}`,
    `Demand: ${career.demand}`,
    "",
    "Write the insights as JSON.",
  ].join("\n");
}
