"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/firebase/auth";
import { enforceRateLimit } from "@/lib/firebase/firestore/rate-limit";
import { consumeFeature } from "@/lib/firebase/firestore/subscription";
import { getCareer } from "@/lib/careers/catalog";
import { getCareerInsights, saveCareerInsights } from "@/lib/firebase/firestore/careerInsights";
import { addFavoriteCareer, removeFavoriteCareer } from "@/lib/firebase/firestore/careerFavorites";
import { setSkillProgress } from "@/lib/firebase/firestore/skillProgress";
import { generateCareerInsights } from "@/lib/ai/services/career-insights";
import { recordUsage } from "@/lib/firebase/firestore/usage";
import { AIError } from "@/lib/ai/types";
import { ROUTES } from "@/config/routes";
import type { CareerInsights } from "@/lib/careers/types";

export type CareerInsightsResult = { ok: true; insights: CareerInsights } | { ok: false; error: string; limitReached?: boolean; feature?: string };

/** Generate (or return cached) AI insights for a career. */
export async function generateCareerInsightsAction(slug: unknown): Promise<CareerInsightsResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };
    const _rl = await enforceRateLimit(decoded.uid, "career-insights", 10);
    if (!_rl.ok) return { ok: false, error: `You're doing that a lot. Please wait ${_rl.retryAfter}s and try again.` };

    const _lim = await consumeFeature(decoded.uid, "careerInsights");
    if (!_lim.allowed) return { ok: false, error: "You've reached your monthly AI Career Insights limit.", limitReached: true, feature: "careerInsights" };
    if (typeof slug !== "string" || !slug) return { ok: false, error: "Unknown career." };
    const career = getCareer(slug);
    if (!career) return { ok: false, error: "Unknown career." };

    const cached = await getCareerInsights(slug);
    if (cached) return { ok: true, insights: cached };

    const result = await generateCareerInsights(career);
    await saveCareerInsights(slug, result.insights);

    try {
      await recordUsage(decoded.uid, {
        requests: 1,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });
    } catch {
      // metering best-effort
    }

    return { ok: true, insights: result.insights };
  } catch (error) {
    if (error instanceof AIError) {
      const message =
        error.code === "not_configured"
          ? "AI insights aren't configured yet. Add a Gemini API key to enable them."
          : "The AI couldn't generate insights just now. Please try again.";
      return { ok: false, error: message };
    }
    return { ok: false, error: "Something went wrong generating insights. Please try again." };
  }
}

const favoriteSchema = z.object({ slug: z.string().min(1), favorite: z.boolean() });

export type ToggleFavoriteResult = { ok: true; favorite: boolean } | { ok: false; error: string };

/** Save or unsave a career. `favorite` is the desired next state. */
export async function toggleFavoriteCareer(input: unknown): Promise<ToggleFavoriteResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    const parsed = favoriteSchema.parse(input);
    if (!getCareer(parsed.slug)) return { ok: false, error: "Unknown career." };

    if (parsed.favorite) await addFavoriteCareer(decoded.uid, parsed.slug);
    else await removeFavoriteCareer(decoded.uid, parsed.slug);

    revalidatePath(ROUTES.careers);
    return { ok: true, favorite: parsed.favorite };
  } catch {
    return { ok: false, error: "Couldn't update your saved careers. Please try again." };
  }
}

const progressSchema = z.object({
  careerSlug: z.string().min(1),
  learned: z.array(z.string()).max(50),
});

export type UpdateSkillProgressResult = { ok: true } | { ok: false; error: string };

/** Persist which missing skills the user has marked as learned for a career. */
export async function updateSkillProgress(input: unknown): Promise<UpdateSkillProgressResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    const parsed = progressSchema.parse(input);
    await setSkillProgress(decoded.uid, parsed.careerSlug, parsed.learned);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save your progress. Please try again." };
  }
}
