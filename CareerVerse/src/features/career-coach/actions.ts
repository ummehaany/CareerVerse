"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { enforceRateLimit } from "@/lib/firebase/firestore/rate-limit";
import { consumeFeature } from "@/lib/firebase/firestore/subscription";
import { recordUsage } from "@/lib/firebase/firestore/usage";
import { isAIConfigured } from "@/lib/ai";
import { generateCareerPlan } from "@/lib/ai/services/career-planner";
import { buildMemoryContext } from "@/lib/memory/context";
import { recordFaq } from "@/lib/firebase/firestore/memory";
import { buildFallbackPlan } from "@/lib/ai/services/career-plan-fallback";
import {
  deleteConversation,
  setConversationPinned,
  upsertConversation,
} from "@/lib/firebase/firestore/coachConversations";
import { ROUTES } from "@/config/routes";
import { buildCoachContext } from "./context";
import { parseGoal, resolveCareer, buildPlanSeed } from "./plan-catalog";
import type { CareerPlan } from "./plan-types";

const planSchema = z.object({ goal: z.string().min(1).max(200) });

export type GeneratePlanResult =
  | { ok: true; plan: CareerPlan; aiUsed: boolean }
  | { ok: false; error: string; limitReached?: boolean; feature?: string };

/** Race a promise against a timeout so a slow model never hangs the UI. */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms)),
  ]);
}

function conversationIdFor(): string {
  return `plan-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * The Career Planning Engine entrypoint: one request → one complete structured
 * plan. Seeds from CareerVerse catalog + the user's own data, uses AI when
 * available (with a timeout), and always falls back to a deterministic plan so
 * the response is fast and reliable. Never asks follow-up questions.
 */
export async function generateCareerPlanAction(input: unknown): Promise<GeneratePlanResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };
    const _rl = await enforceRateLimit(decoded.uid, "career-plan", 6);
    if (!_rl.ok) return { ok: false, error: `You're doing that a lot. Please wait ${_rl.retryAfter}s and try again.` };

    const _lim = await consumeFeature(decoded.uid, "careerPlanning");
    if (!_lim.allowed) return { ok: false, error: "You've reached your monthly AI Career Planning limit.", limitReached: true, feature: "careerPlanning" };
    const { goal } = planSchema.parse(input);
    const cleaned = parseGoal(goal);
    const career = resolveCareer(cleaned);
    const context = await buildCoachContext(decoded.uid);
    const seed = buildPlanSeed(cleaned, career, context);
    const personalized = context.hasData;
    const memory = await buildMemoryContext(decoded.uid).catch(() => "");
    void recordFaq(decoded.uid, goal.trim());

    let plan: CareerPlan | null = null;
    let aiUsed = false;

    if (isAIConfigured()) {
      try {
        const result = await withTimeout(generateCareerPlan(seed, personalized, memory), 22_000);
        plan = result.plan;
        aiUsed = true;
        await recordUsage(decoded.uid, {
          requests: 1,
          inputTokens: result.usage.inputTokens,
          outputTokens: result.usage.outputTokens,
        }).catch(() => {});
      } catch {
        plan = null; // fall through to the deterministic plan
      }
    }

    if (!plan) plan = buildFallbackPlan(seed, personalized);

    // Persist a compact report record for history + session count (non-fatal).
    try {
      await upsertConversation(decoded.uid, {
        id: conversationIdFor(),
        title: plan.careerTitle,
        pinned: false,
        messages: [
          { role: "user", content: goal.trim() },
          { role: "assistant", content: `Career plan for ${plan.careerTitle}: ${plan.overview.what}`.slice(0, 500) },
        ],
      });
      revalidatePath(ROUTES.coach);
    } catch {
      /* history is best-effort */
    }

    return { ok: true, plan, aiUsed };
  } catch {
    return { ok: false, error: "Couldn't generate your career plan just now. Please try again." };
  }
}

export type SimpleResult = { ok: true } | { ok: false };

export async function deleteConversationAction(id: string): Promise<SimpleResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false };
    await deleteConversation(decoded.uid, id);
    revalidatePath(ROUTES.coach);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

export async function pinConversationAction(id: string, pinned: boolean): Promise<SimpleResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false };
    await setConversationPinned(decoded.uid, id, pinned);
    revalidatePath(ROUTES.coach);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
