import type { ResumeData } from "@/types/resume";
import { getAIProvider } from "../index";
import {
  RESUME_SYSTEM,
  buildSummaryPrompt,
  buildImproveBulletsPrompt,
  buildSuggestSkillsPrompt,
  buildImproveTextPrompt,
  buildAtsPrompt,
} from "../prompts/resume";

// ── Parsing helpers ─────────────────────────────────────────────────────────

function toLines(text: string, max = 8): string[] {
  return text
    .split(/\r?\n/)
    .map((l) => l.replace(/^\s*(?:[-*•\d.)]+)\s*/, "").trim())
    .filter(Boolean)
    .slice(0, max);
}

function toList(text: string, max = 8): string[] {
  const raw = text.includes("\n") ? toLines(text, max * 2) : text.split(/[,;]/);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    const clean = item.replace(/^\s*(?:[-*•\d.)]+)\s*/, "").trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
    if (out.length >= max) break;
  }
  return out;
}

// ── AI-backed generators (throw AIError when the provider is unavailable) ────

export async function aiSummary(resume: ResumeData, memoryContext?: string): Promise<string> {
  const provider = getAIProvider();
  const { text } = await provider.generateText({
    system: RESUME_SYSTEM,
    prompt: buildSummaryPrompt(resume) + (memoryContext ? `\n\n${memoryContext}` : ""),
    temperature: 0.6,
    maxOutputTokens: 300,
  });
  return text.trim();
}

export async function aiImproveBullets(role: string, bullets: string[], memoryContext?: string): Promise<string[]> {
  const provider = getAIProvider();
  const { text } = await provider.generateText({
    system: RESUME_SYSTEM,
    prompt: buildImproveBulletsPrompt(role, bullets) + (memoryContext ? `\n\n${memoryContext}` : ""),
    temperature: 0.6,
    maxOutputTokens: 500,
  });
  return toLines(text, Math.max(bullets.length, 4));
}

export async function aiSuggestSkills(resume: ResumeData): Promise<string[]> {
  const provider = getAIProvider();
  const { text } = await provider.generateText({
    system: RESUME_SYSTEM,
    prompt: buildSuggestSkillsPrompt(resume),
    temperature: 0.5,
    maxOutputTokens: 200,
  });
  return toList(text, 8);
}

export async function aiImproveText(text: string): Promise<string> {
  const provider = getAIProvider();
  const { text: out } = await provider.generateText({
    system: RESUME_SYSTEM,
    prompt: buildImproveTextPrompt(text),
    temperature: 0.5,
    maxOutputTokens: 400,
  });
  return out.trim();
}

export async function aiAtsTips(resume: ResumeData, memoryContext?: string): Promise<string[]> {
  const provider = getAIProvider();
  const { text } = await provider.generateText({
    system: RESUME_SYSTEM,
    prompt: buildAtsPrompt(resume) + (memoryContext ? `\n\n${memoryContext}` : ""),
    temperature: 0.4,
    maxOutputTokens: 300,
  });
  return toLines(text, 6);
}

// ── Deterministic local fallbacks (never throw) ─────────────────────────────

const ACTION_VERBS = ["Led", "Built", "Developed", "Improved", "Delivered", "Owned", "Drove", "Designed"];

export function localSummary(resume: ResumeData): string {
  const title = resume.contact.headline.trim() || "Professional";
  const topSkills = resume.skills.slice(0, 4).join(", ");
  const years = resume.experience.length;
  const exp = years > 0 ? `${years}+ role${years > 1 ? "s" : ""} of hands-on experience` : "a strong foundation";
  const skillPart = topSkills ? ` skilled in ${topSkills}` : "";
  return `${title} with ${exp}${skillPart}. Focused on delivering measurable results, collaborating across teams, and continuously learning to solve meaningful problems.`;
}

export function localImproveBullets(bullets: string[]): string[] {
  return bullets
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b, i) => {
      const first = b.split(/\s+/)[0] ?? "";
      const startsStrong = ACTION_VERBS.some((v) => v.toLowerCase() === first.toLowerCase());
      let out = b.charAt(0).toUpperCase() + b.slice(1);
      if (!startsStrong) out = `${ACTION_VERBS[i % ACTION_VERBS.length]} ${out.charAt(0).toLowerCase()}${out.slice(1)}`;
      return out.replace(/\.*$/, "");
    });
}

const SKILL_BANK: Record<string, string[]> = {
  engineer: ["Git", "REST APIs", "Unit Testing", "CI/CD", "Docker", "System Design", "Agile"],
  frontend: ["TypeScript", "React", "Accessibility", "Responsive Design", "Testing Library", "Performance"],
  backend: ["Node.js", "SQL", "Caching", "Message Queues", "API Design", "Observability"],
  data: ["Python", "SQL", "Pandas", "Data Visualization", "Statistics", "ETL"],
  design: ["Figma", "Design Systems", "Prototyping", "User Research", "Wireframing"],
  product: ["Roadmapping", "Stakeholder Management", "A/B Testing", "Analytics", "User Stories"],
  marketing: ["SEO", "Content Strategy", "Google Analytics", "Campaign Management", "Copywriting"],
};

export function localSuggestSkills(resume: ResumeData): string[] {
  const hay = `${resume.contact.headline} ${resume.experience.map((e) => e.role).join(" ")}`.toLowerCase();
  const existing = new Set(resume.skills.map((s) => s.toLowerCase()));
  const picked: string[] = [];
  const pools = Object.entries(SKILL_BANK).filter(([k]) => hay.includes(k));
  const source = (pools.length ? pools : Object.entries(SKILL_BANK)).flatMap(([, v]) => v);
  for (const skill of source) {
    if (existing.has(skill.toLowerCase())) continue;
    if (picked.some((p) => p.toLowerCase() === skill.toLowerCase())) continue;
    picked.push(skill);
    if (picked.length >= 8) break;
  }
  return picked;
}

export function localImproveText(text: string): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return cleaned;
  const sentences = cleaned.split(/(?<=[.!?])\s+/).map((s) => s.charAt(0).toUpperCase() + s.slice(1));
  let out = sentences.join(" ");
  if (!/[.!?]$/.test(out)) out += ".";
  return out;
}
