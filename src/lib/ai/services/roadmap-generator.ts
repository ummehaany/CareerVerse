import { z } from "zod";
import type { StructuredProfile } from "@/types/assessment";
import type { RoadmapStage, StageLevel } from "@/types/roadmap";
import type { TokenUsage } from "../types";
import { getAIProvider } from "../index";
import { guardProfile } from "../guardrails";
import { buildRoadmapSystemPrompt, buildRoadmapUserPrompt } from "../prompts/roadmap";

const projectSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
});

const milestoneSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  skills: z.array(z.string()),
  estimatedTime: z.string().min(1),
  projects: z.array(projectSchema),
  certifications: z.array(z.string()),
  resources: z.array(z.string()),
});

const stageSchema = z.object({
  level: z.enum(["beginner", "intermediate", "advanced"]),
  title: z.string().min(1),
  summary: z.string().min(1),
  estimatedTime: z.string().min(1),
  milestones: z.array(milestoneSchema).min(1).max(6),
});

const roadmapSchema = z.object({
  overview: z.string().min(1),
  totalEstimatedTime: z.string().min(1),
  stages: z.array(stageSchema).length(3),
});

const RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "OBJECT",
  properties: {
    overview: { type: "STRING" },
    totalEstimatedTime: { type: "STRING" },
    stages: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          level: { type: "STRING" },
          title: { type: "STRING" },
          summary: { type: "STRING" },
          estimatedTime: { type: "STRING" },
          milestones: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                description: { type: "STRING" },
                skills: { type: "ARRAY", items: { type: "STRING" } },
                estimatedTime: { type: "STRING" },
                projects: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      title: { type: "STRING" },
                      description: { type: "STRING" },
                    },
                    required: ["title", "description"],
                  },
                },
                certifications: { type: "ARRAY", items: { type: "STRING" } },
                resources: { type: "ARRAY", items: { type: "STRING" } },
              },
              required: [
                "title",
                "description",
                "skills",
                "estimatedTime",
                "projects",
                "certifications",
                "resources",
              ],
            },
          },
        },
        required: ["level", "title", "summary", "estimatedTime", "milestones"],
      },
    },
  },
  required: ["overview", "totalEstimatedTime", "stages"],
};

const STAGE_ORDER: Record<StageLevel, number> = { beginner: 0, intermediate: 1, advanced: 2 };

function dedupeTrim(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const clean = value.trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}

type RoadmapDraft = z.infer<typeof roadmapSchema>;

/** Assign stable milestone ids and enforce canonical stage order. */
function normalizeStages(draft: RoadmapDraft): RoadmapStage[] {
  const ordered = [...draft.stages].sort((a, b) => STAGE_ORDER[a.level] - STAGE_ORDER[b.level]);

  return ordered.map((stage, stageIndex) => ({
    level: stage.level,
    title: stage.title.trim(),
    summary: stage.summary.trim(),
    estimatedTime: stage.estimatedTime.trim(),
    milestones: stage.milestones.slice(0, 6).map((milestone, milestoneIndex) => ({
      id: `s${stageIndex}m${milestoneIndex}`,
      title: milestone.title.trim(),
      description: milestone.description.trim(),
      skills: dedupeTrim(milestone.skills),
      estimatedTime: milestone.estimatedTime.trim(),
      projects: milestone.projects.slice(0, 4).map((project) => ({
        title: project.title.trim(),
        description: project.description.trim(),
      })),
      certifications: dedupeTrim(milestone.certifications),
      resources: dedupeTrim(milestone.resources),
    })),
  }));
}

export interface RoadmapResult {
  overview: string;
  totalEstimatedTime: string;
  stages: RoadmapStage[];
  provider: string;
  model: string;
  usage: TokenUsage;
}

/**
 * Generate a personalized beginner → intermediate → advanced roadmap toward the
 * target career, calibrated to the learner's assessment profile.
 */
export async function generateRoadmap(
  careerTitle: string,
  profile: StructuredProfile,
  memoryContext?: string,
): Promise<RoadmapResult> {
  guardProfile(profile);

  const provider = getAIProvider();
  const { data, usage } = await provider.generateObject(roadmapSchema, {
    system: buildRoadmapSystemPrompt(),
    prompt: buildRoadmapUserPrompt(careerTitle, profile) + (memoryContext ? `\n\n${memoryContext}` : ""),
    temperature: 0.6,
    maxOutputTokens: 8000,
    responseSchema: RESPONSE_SCHEMA,
  });

  return {
    overview: data.overview.trim(),
    totalEstimatedTime: data.totalEstimatedTime.trim(),
    stages: normalizeStages(data),
    provider: provider.name,
    model: provider.model,
    usage,
  };
}
