"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { enforceRateLimit } from "@/lib/firebase/firestore/rate-limit";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getCareerDiscovery } from "@/lib/firebase/firestore/careerDiscovery";
import { getUser } from "@/lib/firebase/firestore/users";
import { saveRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { recordUsage } from "@/lib/firebase/firestore/usage";
import { scoreCareerDiscovery } from "@/features/assessment/discovery/scoring";
import { personalizeRecommendations } from "@/lib/ai/services/career-recommender";
import { buildDeterministicRecommendations } from "@/lib/ai/services/recommendation-fallback";
import type { CareerRecommendation, RecommendationSource } from "@/types/recommendation";
import type { TokenUsage } from "@/lib/ai/types";
import { buildMemoryContext } from "@/lib/memory/context";
import { recordMemoryEvent } from "@/lib/firebase/firestore/memory";
import { ROUTES } from "@/config/routes";

export type GenerateRecommendationsResult = { ok: true } | { ok: false; error: string };

/** How many of Career Discovery's ranked careers become recommendation cards. */
const TOP_N = 5;

/**
 * Generate (or regenerate) the user's Top 5 career recommendations.
 *
 * The ranking is never independently invented here or by the AI: it is
 * recomputed fresh, server-side, from the user's own stored Career Discovery
 * answers via `scoreCareerDiscovery` — the same deterministic field+trait
 * engine that produced the Top 3 the user already saw right after finishing
 * the assessment. Same answers always produce the same ranking. An AI pass
 * (`personalizeRecommendations`) may rewrite the wording of a few narrative
 * fields for those exact, already-decided careers; if the AI is unavailable
 * or errors, the deterministic result is shown as-is (tagged "offline" in
 * the UI) — the user always gets a recommendation, and it is always the
 * ranking `scoring.ts` computed, never something an AI invented.
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

    const discovery = await getCareerDiscovery(uid, assessment.id);
    if (!discovery || !discovery.completed) {
      return {
        ok: false,
        error: "Complete Career Discovery first to generate recommendations.",
      };
    }

    const discoveryResult = scoreCareerDiscovery(discovery.basicAnswers, discovery.advancedAnswers);
    const topMatches = discoveryResult.all.slice(0, TOP_N);
    const baseRecommendations = buildDeterministicRecommendations(topMatches, assessment.structured);

    if (baseRecommendations.length === 0) {
      return {
        ok: false,
        error: "We couldn't match any careers to your answers just now. Please try again.",
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
      const personalized = await personalizeRecommendations(
        baseRecommendations,
        topMatches,
        assessment.structured,
        user?.displayName ?? null,
        memory,
      );
      recommendations = personalized.recommendations;
      provider = personalized.provider;
      model = personalized.model;
      usage = personalized.usage;
      source = "ai";
    } catch (aiError) {
      // Never fail the user — the deterministic base (already grounded in
      // the real matching engine + catalog) is a complete, correct result
      // on its own; AI only ever adds personalized wording on top of it.
      console.error(
        "[recommendations] AI personalization unavailable; using deterministic result:",
        aiError instanceof Error ? aiError.message : aiError,
      );
      recommendations = baseRecommendations;
      provider = "deterministic";
      model = "career-discovery-scoring";
      source = "fallback";
    }

    void recordMemoryEvent(uid, {
      type: "recommendation",
      title: `Career recommendations generated`,
      detail: recommendations[0]?.title ? `Top match: ${recommendations[0].title}` : undefined,
    });

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
