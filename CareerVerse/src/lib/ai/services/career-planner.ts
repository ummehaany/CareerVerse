import { z } from "zod";
import type { CareerPlan } from "@/features/career-coach/plan-types";
import type { TokenUsage } from "../types";
import { getAIProvider } from "../index";
import { buildCareerPlanSystemPrompt, buildCareerPlanUserPrompt, type PlanSeed } from "../prompts/career-plan";

const projectSchema = z.object({
  name: z.string().min(1),
  difficulty: z.string().min(1),
  skills: z.array(z.string()),
  description: z.string().min(1),
});

const planSchema = z.object({
  careerTitle: z.string().min(1),
  overview: z.object({
    what: z.string().min(1),
    suitableFor: z.string().min(1),
    responsibilities: z.array(z.string()).min(1),
  }),
  skills: z.array(z.string()).min(1),
  roadmap: z.array(z.object({ month: z.number(), label: z.string(), focus: z.array(z.string()) })).min(1),
  projects: z.array(projectSchema).min(1),
  courses: z.object({ free: z.array(z.string()), paid: z.array(z.string()) }),
  resources: z.object({
    books: z.array(z.string()),
    documentation: z.array(z.string()),
    youtube: z.array(z.string()),
    practice: z.array(z.string()),
  }),
  salary: z.object({ entry: z.string(), mid: z.string(), senior: z.string(), note: z.string() }),
  tools: z.array(z.string()).min(1),
  interviewPrep: z.object({
    technicalTopics: z.array(z.string()),
    hrQuestions: z.array(z.string()),
    coding: z.array(z.string()),
    aptitude: z.array(z.string()),
  }),
  resumeTips: z.object({
    skillsToHighlight: z.array(z.string()),
    projectsToInclude: z.array(z.string()),
    certifications: z.array(z.string()),
    portfolio: z.array(z.string()),
  }),
  weeklyPlan: z.array(z.object({ week: z.number(), focus: z.string() })).min(1),
});

type PlanDraft = z.infer<typeof planSchema>;

const S = { type: "STRING" } as const;
const SA = { type: "ARRAY", items: { type: "STRING" } } as const;

const RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "OBJECT",
  properties: {
    careerTitle: S,
    overview: {
      type: "OBJECT",
      properties: { what: S, suitableFor: S, responsibilities: SA },
      required: ["what", "suitableFor", "responsibilities"],
    },
    skills: SA,
    roadmap: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { month: { type: "NUMBER" }, label: S, focus: SA },
        required: ["month", "label", "focus"],
      },
    },
    projects: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { name: S, difficulty: S, skills: SA, description: S },
        required: ["name", "difficulty", "skills", "description"],
      },
    },
    courses: {
      type: "OBJECT",
      properties: { free: SA, paid: SA },
      required: ["free", "paid"],
    },
    resources: {
      type: "OBJECT",
      properties: { books: SA, documentation: SA, youtube: SA, practice: SA },
      required: ["books", "documentation", "youtube", "practice"],
    },
    salary: {
      type: "OBJECT",
      properties: { entry: S, mid: S, senior: S, note: S },
      required: ["entry", "mid", "senior", "note"],
    },
    tools: SA,
    interviewPrep: {
      type: "OBJECT",
      properties: { technicalTopics: SA, hrQuestions: SA, coding: SA, aptitude: SA },
      required: ["technicalTopics", "hrQuestions", "coding", "aptitude"],
    },
    resumeTips: {
      type: "OBJECT",
      properties: { skillsToHighlight: SA, projectsToInclude: SA, certifications: SA, portfolio: SA },
      required: ["skillsToHighlight", "projectsToInclude", "certifications", "portfolio"],
    },
    weeklyPlan: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { week: { type: "NUMBER" }, focus: S },
        required: ["week", "focus"],
      },
    },
  },
  required: [
    "careerTitle", "overview", "skills", "roadmap", "projects", "courses",
    "resources", "salary", "tools", "interviewPrep", "resumeTips", "weeklyPlan",
  ],
};

function normalizeDifficulty(v: string): "Beginner" | "Intermediate" | "Advanced" {
  const s = v.toLowerCase();
  if (s.startsWith("adv")) return "Advanced";
  if (s.startsWith("int")) return "Intermediate";
  return "Beginner";
}

function clean(list: string[], cap = 20): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of list) {
    const t = v.trim();
    if (!t) continue;
    const k = t.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(t);
    if (out.length >= cap) break;
  }
  return out;
}

function normalize(draft: PlanDraft, personalized: boolean): CareerPlan {
  return {
    careerTitle: draft.careerTitle.trim(),
    overview: {
      what: draft.overview.what.trim(),
      suitableFor: draft.overview.suitableFor.trim(),
      responsibilities: clean(draft.overview.responsibilities, 8),
    },
    skills: clean(draft.skills, 16),
    roadmap: draft.roadmap
      .slice(0, 6)
      .map((m, i) => ({ month: m.month || i + 1, label: m.label.trim(), focus: clean(m.focus, 6) })),
    projects: draft.projects.slice(0, 8).map((p) => ({
      name: p.name.trim(),
      difficulty: normalizeDifficulty(p.difficulty),
      skills: clean(p.skills, 6),
      description: p.description.trim(),
    })),
    courses: { free: clean(draft.courses.free, 8), paid: clean(draft.courses.paid, 8) },
    resources: {
      books: clean(draft.resources.books, 6),
      documentation: clean(draft.resources.documentation, 6),
      youtube: clean(draft.resources.youtube, 6),
      practice: clean(draft.resources.practice, 6),
    },
    salary: {
      entry: draft.salary.entry.trim(),
      mid: draft.salary.mid.trim(),
      senior: draft.salary.senior.trim(),
      note: draft.salary.note.trim(),
    },
    tools: clean(draft.tools, 12),
    interviewPrep: {
      technicalTopics: clean(draft.interviewPrep.technicalTopics, 10),
      hrQuestions: clean(draft.interviewPrep.hrQuestions, 8),
      coding: clean(draft.interviewPrep.coding, 8),
      aptitude: clean(draft.interviewPrep.aptitude, 8),
    },
    resumeTips: {
      skillsToHighlight: clean(draft.resumeTips.skillsToHighlight, 10),
      projectsToInclude: clean(draft.resumeTips.projectsToInclude, 6),
      certifications: clean(draft.resumeTips.certifications, 6),
      portfolio: clean(draft.resumeTips.portfolio, 6),
    },
    weeklyPlan: draft.weeklyPlan.slice(0, 8).map((w, i) => ({ week: w.week || i + 1, focus: w.focus.trim() })),
    source: "ai",
    personalized,
  };
}

export interface CareerPlanResult {
  plan: CareerPlan;
  provider: string;
  model: string;
  usage: TokenUsage;
}

/** Generate a complete, structured career report in a single model call. */
export async function generateCareerPlan(seed: PlanSeed, personalized: boolean, memoryContext?: string): Promise<CareerPlanResult> {
  const provider = getAIProvider();
  const { data, usage } = await provider.generateObject(planSchema, {
    system: buildCareerPlanSystemPrompt(),
    prompt: buildCareerPlanUserPrompt(seed) + (memoryContext ? `\n\n${memoryContext}` : ""),
    temperature: 0.5,
    maxOutputTokens: 8000,
    responseSchema: RESPONSE_SCHEMA,
  });
  return { plan: normalize(data, personalized), provider: provider.name, model: provider.model, usage };
}
