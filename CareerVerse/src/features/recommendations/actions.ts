"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getUser } from "@/lib/firebase/firestore/users";
import { saveRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { recordUsage } from "@/lib/firebase/firestore/usage";
import { recommendCareers } from "@/lib/ai/services/career-recommender";
import { AIError } from "@/lib/ai/types";
import { ROUTES } from "@/config/routes";

export type GenerateRecommendationsResult = { ok: true } | { ok: false; error: string };

function messageForAIError(error: AIError): string {
  switch (error.code) {
    case "not_configured":
      return "AI recommendations aren't configured yet. Add a Gemini API key to enable them.";
    case "insufficient_input":
      return "There isn't enough assessment data yet — retake the assessment with a bit more detail.";
    case "schema_mismatch":
    case "invalid_json":
    case "empty_response":
      return "The AI returned an unexpected response. Please try generating again.";
    default:
      return "The AI couldn't generate recommendations just now. Please try again.";
  }
}

/**
 * Analyze the user's completed assessment and generate (or regenerate) their
 * Top 5 career recommendations, persisting the result. Safe to call repeatedly
 * — each run creates a fresh set tied to the current assessment.
 */
export async function generateRecommendations(): Promise<GenerateRecommendationsResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };
    const uid = decoded.uid;

    const assessment = await getLatestAssessment(uid);
    if (!assessment || assessment.status !== "completed" || !assessment.structured) {
      return {
        ok: false,
        error: "Complete your career assessment first to generate recommendations.",
      };
    }

    const user = await getUser(uid);
    const result = await recommendCareers(assessment.structured, user?.displayName ?? null);

    await saveRecommendationSet(uid, {
      assessmentId: assessment.id,
      provider: result.provider,
      model: result.model,
      recommendations: result.recommendations,
    });

    // Best-effort metering; never blocks the feature.
    try {
      await recordUsage(uid, {
        requests: 1,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });
    } catch {
      // ignore metering failures
    }

    revalidatePath(ROUTES.recommendations);
    revalidatePath(ROUTES.dashboard);
    return { ok: true };
  } catch (error) {
    if (error instanceof AIError) {
      return { ok: false, error: messageForAIError(error) };
    }
    return {
      ok: false,
      error: "Something went wrong generating your recommendations. Please try again.",
    };
  }
}
