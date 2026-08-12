"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { enforceRateLimit } from "@/lib/firebase/firestore/rate-limit";
import { consumeFeature } from "@/lib/firebase/firestore/subscription";
import { saveInterview } from "@/lib/firebase/firestore/interviews";
import { recordUsage } from "@/lib/firebase/firestore/usage";
import { generateInterviewQuestions, evaluateInterview } from "@/lib/ai/services/interview-coach";
import { ROUTES } from "@/config/routes";
import type { InterviewEvaluation, InterviewQuestion } from "@/types/interview";
import { generateQuestionsSchema, submitInterviewSchema } from "./schema";
import { notifyInterviewProgress, syncAchievements } from "@/lib/email/triggers";
import { buildMemoryContext } from "@/lib/memory/context";
import { recordMemoryEvent, addMemoryRecommendation } from "@/lib/firebase/firestore/memory";
import { buildLocalQuestions } from "./question-bank";
import { evaluateLocally } from "./local-eval";

function logAi(label: string, error: unknown) {
  console.error(`[interview] ${label} unavailable; using offline engine:`, error instanceof Error ? error.message : error);
}

export type StartInterviewResult =
  | { ok: true; questions: InterviewQuestion[]; source: "ai" | "offline" }
  | { ok: false; error: string; limitReached?: boolean; feature?: string };

/**
 * Generate role/type-based questions to begin a mock interview. Always succeeds:
 * if the AI provider is unavailable it uses the offline question bank.
 */
export async function startInterview(input: unknown): Promise<StartInterviewResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };
    const _rl = await enforceRateLimit(decoded.uid, "interview-start", 10);
    if (!_rl.ok) return { ok: false, error: `You're doing that a lot. Please wait ${_rl.retryAfter}s and try again.` };

    const _lim = await consumeFeature(decoded.uid, "mockInterview");
    if (!_lim.allowed) return { ok: false, error: "You've reached your monthly Mock Interviews limit.", limitReached: true, feature: "mockInterview" };
    const parsed = generateQuestionsSchema.parse(input);
    const memory = await buildMemoryContext(decoded.uid).catch(() => "");

    let generated: Array<{ question: string; focusArea: string }>;
    let source: "ai" | "offline";
    try {
      const result = await generateInterviewQuestions(parsed.role, parsed.difficulty, parsed.count, parsed.type, memory);
      generated = result.questions;
      source = "ai";
      void recordUsage(decoded.uid, {
        requests: 1,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      }).catch(() => {});
    } catch (e) {
      logAi("question generation", e);
      generated = buildLocalQuestions(parsed.role, parsed.type, parsed.difficulty, parsed.count);
      source = "offline";
    }

    const questions: InterviewQuestion[] = generated.map((q, index) => ({
      id: `q${index}`,
      question: q.question,
      focusArea: q.focusArea,
    }));

    return { ok: true, questions, source };
  } catch {
    return { ok: false, error: "Something went wrong starting the interview. Please try again." };
  }
}

export type SubmitInterviewResult =
  | { ok: true; id: string; evaluation: InterviewEvaluation; source: "ai" | "offline" }
  | { ok: false; error: string };

/** Score answers, persist the session, and return feedback. Always succeeds. */
export async function submitInterview(input: unknown): Promise<SubmitInterviewResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };
    const _rl = await enforceRateLimit(decoded.uid, "interview-submit", 10);
    if (!_rl.ok) return { ok: false, error: `You're doing that a lot. Please wait ${_rl.retryAfter}s and try again.` };

    const parsed = submitInterviewSchema.parse(input);
    const memory = await buildMemoryContext(decoded.uid).catch(() => "");
    const answerByQuestion = new Map(parsed.answers.map((a) => [a.questionId, a.answer]));
    const qa = parsed.questions.map((q) => ({
      question: q.question,
      focusArea: q.focusArea,
      answer: answerByQuestion.get(q.id) ?? "",
    }));

    let evaluation: InterviewEvaluation;
    let provider = "offline";
    let model = "rule-based";
    let source: "ai" | "offline" = "offline";
    let usage: { inputTokens: number; outputTokens: number } | null = null;

    try {
      const result = await evaluateInterview(parsed.role, parsed.difficulty, parsed.type, qa, memory);
      evaluation = {
        items: result.items.map((item) => ({
          questionId: parsed.questions[item.index]?.id ?? parsed.questions[0]!.id,
          score: item.score,
          feedback: item.feedback,
        })),
        overallScore: result.overallScore,
        summary: result.summary,
        strengths: result.strengths,
        improvements: result.improvements,
        dimensions: result.dimensions,
        nextSteps: result.nextSteps,
      };
      provider = result.provider;
      model = result.model;
      source = "ai";
      usage = { inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens };
    } catch (e) {
      logAi("evaluation", e);
      const local = evaluateLocally(qa);
      evaluation = {
        items: local.items.map((item) => ({
          questionId: parsed.questions[item.index]?.id ?? parsed.questions[0]!.id,
          score: item.score,
          feedback: item.feedback,
        })),
        overallScore: local.overallScore,
        summary: local.summary,
        strengths: local.strengths,
        improvements: local.improvements,
        dimensions: local.dimensions,
        nextSteps: local.nextSteps,
      };
    }

    const { id } = await saveInterview(decoded.uid, {
      role: parsed.role,
      type: parsed.type,
      difficulty: parsed.difficulty,
      provider,
      model,
      questions: parsed.questions,
      answers: parsed.answers,
      evaluation,
    });

    if (usage) {
      void recordUsage(decoded.uid, { requests: 1, inputTokens: usage.inputTokens, outputTokens: usage.outputTokens }).catch(() => {});
    }

    // Coaching email after a completed mock interview (fire-and-forget).
    void notifyInterviewProgress(decoded.uid, {
      role: parsed.role,
      score: evaluation.overallScore,
      strengths: evaluation.strengths,
      improvements: evaluation.improvements,
    });
    void syncAchievements(decoded.uid);
    // AI memory: log the session + the top improvement so future interviews adapt.
    void recordMemoryEvent(decoded.uid, { type: "interview", title: `Mock interview: ${parsed.role}`, detail: `Scored ${evaluation.overallScore}/100`, score: evaluation.overallScore });
    if (evaluation.improvements[0]) void addMemoryRecommendation(decoded.uid, evaluation.improvements[0], "interview");

    revalidatePath(ROUTES.interviews);
    revalidatePath(ROUTES.dashboard);
    return { ok: true, id, evaluation, source };
  } catch {
    return { ok: false, error: "Something went wrong scoring your interview. Please try again." };
  }
}
