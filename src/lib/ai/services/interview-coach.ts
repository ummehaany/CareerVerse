import { z } from "zod";
import type { InterviewDifficulty, InterviewDimensions, InterviewType } from "@/types/interview";
import type { TokenUsage } from "../types";
import { getAIProvider } from "../index";
import {
  buildQuestionsSystemPrompt,
  buildQuestionsUserPrompt,
  buildEvaluationSystemPrompt,
  buildEvaluationUserPrompt,
} from "../prompts/interview";

// ── Question generation ────────────────────────────────────────────────────

const questionsSchema = z.object({
  questions: z
    .array(z.object({ question: z.string().min(1), focusArea: z.string().min(1) }))
    .min(1)
    .max(10),
});

const QUESTIONS_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "OBJECT",
  properties: {
    questions: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: { question: { type: "STRING" }, focusArea: { type: "STRING" } },
        required: ["question", "focusArea"],
      },
    },
  },
  required: ["questions"],
};

export interface GeneratedQuestion {
  question: string;
  focusArea: string;
}

export interface QuestionsResult {
  questions: GeneratedQuestion[];
  provider: string;
  model: string;
  usage: TokenUsage;
}

export async function generateInterviewQuestions(
  role: string,
  difficulty: InterviewDifficulty,
  count: number,
  type: InterviewType,
  memoryContext?: string,
): Promise<QuestionsResult> {
  const provider = getAIProvider();
  const { data, usage } = await provider.generateObject(questionsSchema, {
    system: buildQuestionsSystemPrompt(),
    prompt: buildQuestionsUserPrompt(role, difficulty, count, type) + (memoryContext ? `\n\n${memoryContext}` : ""),
    temperature: 0.7,
    maxOutputTokens: 2000,
    responseSchema: QUESTIONS_RESPONSE_SCHEMA,
  });

  return {
    questions: data.questions.slice(0, count),
    provider: provider.name,
    model: provider.model,
    usage,
  };
}

// ── Answer evaluation ──────────────────────────────────────────────────────

const dimensionsSchema = z.object({
  communication: z.number().min(0).max(100),
  confidence: z.number().min(0).max(100),
  technical: z.number().min(0).max(100),
  problemSolving: z.number().min(0).max(100),
});

const evaluationSchema = z.object({
  items: z.array(
    z.object({
      index: z.number().int().min(0),
      score: z.number().min(0).max(10),
      feedback: z.string().min(1),
    }),
  ),
  overallScore: z.number().min(0).max(100),
  summary: z.string().min(1),
  strengths: z.array(z.string()),
  improvements: z.array(z.string()),
  dimensions: dimensionsSchema,
  nextSteps: z.array(z.string()),
});

const EVALUATION_RESPONSE_SCHEMA: Record<string, unknown> = {
  type: "OBJECT",
  properties: {
    items: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          index: { type: "INTEGER" },
          score: { type: "NUMBER" },
          feedback: { type: "STRING" },
        },
        required: ["index", "score", "feedback"],
      },
    },
    overallScore: { type: "NUMBER" },
    summary: { type: "STRING" },
    strengths: { type: "ARRAY", items: { type: "STRING" } },
    improvements: { type: "ARRAY", items: { type: "STRING" } },
    dimensions: {
      type: "OBJECT",
      properties: {
        communication: { type: "NUMBER" },
        confidence: { type: "NUMBER" },
        technical: { type: "NUMBER" },
        problemSolving: { type: "NUMBER" },
      },
      required: ["communication", "confidence", "technical", "problemSolving"],
    },
    nextSteps: { type: "ARRAY", items: { type: "STRING" } },
  },
  required: ["items", "overallScore", "summary", "strengths", "improvements", "dimensions", "nextSteps"],
};

export interface EvaluationCoreItem {
  index: number;
  score: number;
  feedback: string;
}

export interface EvaluationResult {
  items: EvaluationCoreItem[];
  overallScore: number;
  summary: string;
  strengths: string[];
  improvements: string[];
  dimensions: InterviewDimensions;
  nextSteps: string[];
  provider: string;
  model: string;
  usage: TokenUsage;
}

const clamp100 = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

export async function evaluateInterview(
  role: string,
  difficulty: InterviewDifficulty,
  type: InterviewType,
  qa: Array<{ question: string; answer: string; focusArea: string }>,
  memoryContext?: string,
): Promise<EvaluationResult> {
  const provider = getAIProvider();
  const { data, usage } = await provider.generateObject(evaluationSchema, {
    system: buildEvaluationSystemPrompt(),
    prompt: buildEvaluationUserPrompt(role, difficulty, type, qa) + (memoryContext ? `\n\n${memoryContext}` : ""),
    temperature: 0.4,
    maxOutputTokens: 3000,
    responseSchema: EVALUATION_RESPONSE_SCHEMA,
  });

  return {
    items: data.items.map((item) => ({
      index: item.index,
      score: Math.max(0, Math.min(10, Math.round(item.score))),
      feedback: item.feedback.trim(),
    })),
    overallScore: clamp100(data.overallScore),
    summary: data.summary.trim(),
    strengths: data.strengths.map((s) => s.trim()).filter(Boolean),
    improvements: data.improvements.map((s) => s.trim()).filter(Boolean),
    dimensions: {
      communication: clamp100(data.dimensions.communication),
      confidence: clamp100(data.dimensions.confidence),
      technical: clamp100(data.dimensions.technical),
      problemSolving: clamp100(data.dimensions.problemSolving),
    },
    nextSteps: data.nextSteps.map((s) => s.trim()).filter(Boolean),
    provider: provider.name,
    model: provider.model,
    usage,
  };
}
