import { buildMemoryProfile } from "@/lib/memory/service";
import type { MemoryProfile } from "@/lib/memory/types";

/**
 * AI CONTEXT BUILDING. Turns a MemoryProfile into a compact, deterministic
 * text block that any AI feature can prepend to its prompt. No LLM call, no
 * latency, no token cost beyond the block itself. Hidden ("forgotten") fields
 * are never included, which is the core privacy guarantee for AI usage.
 */

function isHidden(profile: MemoryProfile, field: string): boolean {
  return profile.hiddenFields.includes(field);
}

function line(label: string, value: string): string {
  return `- ${label}: ${value}`;
}

/** Pure formatter — deterministic and unit-testable. */
export function formatMemoryContext(profile: MemoryProfile): string {
  const lines: string[] = [];

  if (!isHidden(profile, "careerGoal") && profile.careerGoal && profile.careerGoal !== "Not set yet") {
    lines.push(line("Career goal", profile.careerGoal));
  }
  if (profile.targetRole) lines.push(line("Target role", profile.targetRole));
  if (!isHidden(profile, "targetCompanies") && profile.targetCompanies.length) {
    lines.push(line("Target companies", profile.targetCompanies.slice(0, 5).join(", ")));
  }
  if (!isHidden(profile, "strongSkills") && profile.strongSkills.length) {
    lines.push(line("Strengths", profile.strongSkills.slice(0, 10).join(", ")));
  }
  if (!isHidden(profile, "weakSkills") && profile.weakSkills.length) {
    lines.push(line("Areas to improve", profile.weakSkills.slice(0, 10).join(", ")));
  }
  if (!isHidden(profile, "certifications") && profile.certifications.length) {
    lines.push(line("Certifications", profile.certifications.slice(0, 8).join(", ")));
  }
  if (!isHidden(profile, "projects") && profile.projects.length) {
    lines.push(line("Projects", profile.projects.slice(0, 6).join(", ")));
  }
  if (profile.resume.exists) {
    const ats = profile.resume.atsScore != null ? `, ATS ${profile.resume.atsScore}` : "";
    lines.push(line("Resume", `${profile.resume.completion}% complete${ats}`));
  }
  if (profile.roadmap.exists) {
    lines.push(
      line(
        "Roadmap",
        `${profile.roadmap.title ?? "active"} — ${profile.roadmap.percent}% (${profile.roadmap.milestonesDone}/${profile.roadmap.milestonesTotal} milestones)`,
      ),
    );
  }
  if (profile.interview.count > 0) {
    const best = profile.interview.best != null ? `, best ${profile.interview.best}` : "";
    const avg = profile.interview.avg != null ? `, avg ${profile.interview.avg}` : "";
    lines.push(line("Mock interviews", `${profile.interview.count} taken${best}${avg}`));
  }
  lines.push(line("Career Health Score", `${profile.careerHealthScore}/100`));
  if (profile.streak > 0) lines.push(line("Activity streak", `${profile.streak} days`));
  if (!isHidden(profile, "learningStyle") && profile.learningStyle !== "unset") {
    lines.push(line("Preferred learning style", profile.learningStyle.replace("_", "-")));
  }

  const recentAdvice = profile.recommendations.slice(0, 6).map((r) => r.text);
  if (recentAdvice.length) {
    lines.push("");
    lines.push("Advice already given (do NOT repeat verbatim — build on it):");
    for (const a of recentAdvice) lines.push(`  • ${a}`);
  }

  if (lines.length === 0) return "";

  return [
    "[Student memory — long-term context. Personalize your response to this student. Do not restate it back verbatim.]",
    ...lines,
  ].join("\n");
}

/** Load + format the memory context for a user. Returns "" when empty. */
export async function buildMemoryContext(uid: string): Promise<string> {
  try {
    const profile = await buildMemoryProfile(uid);
    return formatMemoryContext(profile);
  } catch (error) {
    console.error("[memory] buildMemoryContext failed:", error instanceof Error ? error.message : error);
    return "";
  }
}

/** Small helper: append a memory block to a prompt when present. */
export function withMemory(prompt: string, memoryContext?: string | null): string {
  return memoryContext && memoryContext.trim() ? `${prompt}\n\n${memoryContext.trim()}` : prompt;
}
