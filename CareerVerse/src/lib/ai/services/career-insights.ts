import { z } from "zod";
import type { Career, CareerInsights } from "@/lib/careers/types";
import type { TokenUsage } from "../types";
import { getAIProvider } from "../index";
import {
  buildCareerInsightsSystemPrompt,
  buildCareerInsightsUserPrompt,
} from "../prompts/career-insights";

const insightsSchema = z.object({
  dayInLife: z.string().min(1),
  insights: z.array(z.string()).min(1),
  recommendedProjects: z
    .array(z.object({ title: z.string().min(1), description: z.string().min(1) }))
    .min(1),
  learningPath: z
    .array(z.object({ stage: z.string().min(1), focus: z.string().min(1) }))
    .min(1),
  outlook: z.string().min(1),
});

const RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "OBJECT",
  properties: {
    dayInLife: { type: "STRING" },
    insights: { type: "ARRAY", items: { type: "STRING" } },
    recommendedProjects: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { title: { type: "STRING" }, description: { type: "STRING" } },
        required: ["title", "description"],
      },
    },
    learningPath: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { stage: { type: "STRING" }, focus: { type: "STRING" } },
        required: ["stage", "focus"],
      },
    },
    outlook: { type: "STRING" },
  },
  required: ["dayInLife", "insights", "recommendedProjects", "learningPath", "outlook"],
};

export interface CareerInsightsResult {
  insights: CareerInsights;
  provider: string;
  model: string;
  usage: TokenUsage;
}

/** Generate career-general insights for a role (cached by the caller). */
export async function generateCareerInsights(career: Career): Promise<CareerInsightsResult> {
  const provider = getAIProvider();
  const { data, usage } = await provider.generateObject(insightsSchema, {
    system: buildCareerInsightsSystemPrompt(),
    prompt: buildCareerInsightsUserPrompt(career),
    temperature: 0.6,
    maxOutputTokens: 2500,
    responseSchema: RESPONSE_SCHEMA,
  });

  return {
    insights: {
      dayInLife: data.dayInLife.trim(),
      insights: data.insights.map((s) => s.trim()).filter(Boolean),
      recommendedProjects: data.recommendedProjects.map((p) => ({
        title: p.title.trim(),
        description: p.description.trim(),
      })),
      learningPath: data.learningPath.map((s) => ({ stage: s.stage.trim(), focus: s.focus.trim() })),
      outlook: data.outlook.trim(),
    },
    provider: provider.name,
    model: provider.model,
    usage,
  };
}
