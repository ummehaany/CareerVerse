"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { saveInterview } from "@/lib/firebase/firestore/interviews";
import { recordUsage } from "@/lib/firebase/firestore/usage";
import {
  generateInterviewQuestions,
  evaluateInterview,
} from "@/lib/ai/services/interview-coach";
import { AIError } from "@/lib/ai/types";
import { ROUTES } from "@/config/routes";
import type { InterviewEvaluation, InterviewQuestion } from "@/types/interview";
import { generateQuestionsSchema, submitInterviewSchema } from "./schema";

function messageForAIError(error: AIError): string {
  switch (error.code) {
    case "not_configured":
      return "AI interviews aren't configured yet. Add a Gemini API key to enable them.";
    case "schema_mismatch":
    case "invalid_json":
    case "empty_response":
      return "The AI returned an unexpected response. Please try again.";
    default:
      return "The AI couldn't run the interview just now. Please try again.";
  }
}

export type StartInterviewResult =
  | { ok: true; questions: InterviewQuestion[] }
  | { ok: false; error: string };

/** Generate role-based questions to begin a mock interview. */
export async function startInterview(input: unknown): Promise<StartInterviewResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    const parsed = generateQuestionsSchema.parse(input);
    const result = await generateInterviewQuestions(parsed.role, parsed.difficulty, parsed.count);

    const questions: InterviewQuestion[] = result.questions.map((q, index) => ({
      id: `q${index}`,
      question: q.question,
      focusArea: q.focusArea,
    }));

    try {
      await recordUsage(decoded.uid, {
        requests: 1,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });
    } catch {
      // metering best-effort
    }

    return { ok: true, questions };
  } catch (error) {
    if (error instanceof AIError) return { ok: false, error: messageForAIError(error) };
    return { ok: false, error: "Something went wrong starting the interview. Please try again." };
  }
}

export type SubmitInterviewResult =
  | { ok: true; id: string; evaluation: InterviewEvaluation }
  | { ok: false; error: string };

/** Score the candidate's answers, persist the session, and return feedback. */
export async function submitInterview(input: unknown): Promise<SubmitInterviewResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    const parsed = submitInterviewSchema.parse(input);
    const answerByQuestion = new Map(parsed.answers.map((a) => [a.questionId, a.answer]));

    const qa = parsed.questions.map((q) => ({
      question: q.question,
      focusArea: q.focusArea,
      answer: answerByQuestion.get(q.id) ?? "",
    }));

    const result = await evaluateInterview(parsed.role, parsed.difficulty, qa);

    const evaluation: InterviewEvaluation = {
      items: result.items.map((item) => ({
        questionId: parsed.questions[item.index]?.id ?? parsed.questions[0]!.id,
        score: item.score,
        feedback: item.feedback,
      })),
      overallScore: result.overallScore,
      summary: result.summary,
      strengths: result.strengths,
      improvements: result.improvements,
    };

    const { id } = await saveInterview(decoded.uid, {
      role: parsed.role,
      difficulty: parsed.difficulty,
      provider: result.provider,
      model: result.model,
      questions: parsed.questions,
      answers: parsed.answers,
      evaluation,
    });

    try {
      await recordUsage(decoded.uid, {
        requests: 1,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });
    } catch {
      // metering best-effort
    }

    revalidatePath(ROUTES.interviews);
    revalidatePath(ROUTES.dashboard);
    return { ok: true, id, evaluation };
  } catch (error) {
    if (error instanceof AIError) return { ok: false, error: messageForAIError(error) };
    return { ok: false, error: "Something went wrong scoring your interview. Please try again." };
  }
}
