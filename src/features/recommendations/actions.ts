"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { enforceRateLimit } from "@/lib/firebase/firestore/rate-limit";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getUser } from "@/lib/firebase/firestore/users";
import { saveRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { recordUsage } from "@/lib/firebase/firestore/usage";
import { recommendCareers } from "@/lib/ai/services/career-recommender";
import { buildFallbackRecommendations } from "@/lib/ai/services/recommendation-fallback";
import type { CareerRecommendation, RecommendationSource } from "@/types/recommendation";
import type { TokenUsage } from "@/lib/ai/types";
import { buildMemoryContext } from "@/lib/memory/context";
import { recordMemoryEvent } from "@/lib/firebase/firestore/memory";
import { ROUTES } from "@/config/routes";

export type GenerateRecommendationsResult = { ok: true } | { ok: false; error: string };

/**
 * Analyze the user's completed assessment and generate (or regenerate) their
 * Top 5 career recommendations, persisting the result. The user ALWAYS gets a
 * recommendation: if the AI provider is unavailable or over quota, a local
 * rule-based engine produces a high-quality set and the result is tagged as an
 * "offline" recommendation for the UI.
 */
export async function generateRecommendations(): Promise<GenerateRecommendationsResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };
    const _rl = await enforceRateLimit(decoded.uid, "recommendations", 6);
    if (!_rl.ok) return { ok: false, error: `You're doing that a lot. Please wait ${_rl.retryAfter}s and try again.` };
    const uid = decoded.uid;

    const assessment = await getLatestAssessment(uid);
    if (!assessment || assessment.status !== "completed" || !assessment.structured) {
      return {
        ok: false,
        error: "Complete your career assessment first to generate recommendations.",
      };
    }

    const user = await getUser(uid);
    const memory = await buildMemoryContext(uid).catch(() => "");

    let recommendations: CareerRecommendation[];
    let provider: string;
    let model: string;
    let source: RecommendationSource;
    let usage: TokenUsage | null = null;

    try {
      const result = await recommendCareers(assessment.structured, user?.displayName ?? null, memory);
      recommendations = result.recommendations;
      provider = result.provider;
      model = result.model;
      usage = result.usage;
      source = "ai";
    } catch (aiError) {
      // Never fail the user — fall back to the local rule-based engine.
      console.error(
        "[recommendations] AI unavailable; using offline engine:",
        aiError instanceof Error ? aiError.message : aiError,
      );
      recommendations = buildFallbackRecommendations(assessment.structured);
      provider = "offline";
      model = "rule-based";
      source = "fallback";
    }

    void recordMemoryEvent(uid, { type: "recommendation", title: `Career recommendations generated`, detail: recommendations[0]?.title ? `Top match: ${recommendations[0].title}` : undefined });

    await saveRecommendationSet(uid, {
      assessmentId: assessment.id,
      provider,
      model,
      source,
      recommendations,
    });

    if (usage) {
      // Best-effort metering; never blocks the feature.
      try {
        await recordUsage(uid, {
          requests: 1,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
        });
      } catch {
        // ignore metering failures
      }
    }

    revalidatePath(ROUTES.recommendations);
    revalidatePath(ROUTES.dashboard);
    return { ok: true };
  } catch (error) {
    console.error(
      "[recommendations] Unexpected failure:",
      error instanceof Error ? error.message : error,
    );
    return {
      ok: false,
      error: "Something went wrong generating your recommendations. Please try again.",
    };
  }
}
