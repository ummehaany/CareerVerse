"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { enforceRateLimit } from "@/lib/firebase/firestore/rate-limit";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { saveRoadmap, setMilestoneStatus } from "@/lib/firebase/firestore/roadmaps";
import { recordUsage } from "@/lib/firebase/firestore/usage";
import { generateRoadmap as generateRoadmapAI } from "@/lib/ai/services/roadmap-generator";
import { buildFallbackRoadmap } from "@/lib/ai/services/roadmap-fallback";
import type { RoadmapStage } from "@/types/roadmap";
import type { TokenUsage } from "@/lib/ai/types";
import { ROUTES } from "@/config/routes";
import { notifyRoadmapReady, syncAchievements } from "@/lib/email/triggers";
import { buildMemoryContext } from "@/lib/memory/context";
import { recordMemoryEvent } from "@/lib/firebase/firestore/memory";
import { generateRoadmapSchema, updateMilestoneSchema } from "./schema";

export type GenerateRoadmapResult = { ok: true; id: string } | { ok: false; error: string };

/**
 * Generate and persist a roadmap for the selected career. Always succeeds when
 * the user has a completed assessment: if the AI provider is unavailable, a
 * local rule-based builder produces a complete roadmap from the career catalog.
 */
export async function generateRoadmap(input: unknown): Promise<GenerateRoadmapResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };
    const _rl = await enforceRateLimit(decoded.uid, "roadmap", 6);
    if (!_rl.ok) return { ok: false, error: `You're doing that a lot. Please wait ${_rl.retryAfter}s and try again.` };
    const uid = decoded.uid;

    const parsed = generateRoadmapSchema.parse(input);

    const assessment = await getLatestAssessment(uid);
    if (!assessment || assessment.status !== "completed" || !assessment.structured) {
      return { ok: false, error: "Complete your career assessment first to build a roadmap." };
    }

    const memory = await buildMemoryContext(uid).catch(() => "");

    let overview: string;
    let totalEstimatedTime: string;
    let stages: RoadmapStage[];
    let provider: string;
    let model: string;
    let usage: TokenUsage | null = null;

    try {
      const result = await generateRoadmapAI(parsed.careerTitle, assessment.structured, memory);
      overview = result.overview;
      totalEstimatedTime = result.totalEstimatedTime;
      stages = result.stages;
      provider = result.provider;
      model = result.model;
      usage = result.usage;
    } catch (aiError) {
      console.error(
        "[roadmap] AI unavailable; using offline builder:",
        aiError instanceof Error ? aiError.message : aiError,
      );
      const fallback = buildFallbackRoadmap(parsed.careerTitle, assessment.structured);
      overview = fallback.overview;
      totalEstimatedTime = fallback.totalEstimatedTime;
      stages = fallback.stages;
      provider = "offline";
      model = "rule-based";
    }

    const { id } = await saveRoadmap(uid, {
      careerTitle: parsed.careerTitle,
      assessmentId: assessment.id,
      provider,
      model,
      overview,
      totalEstimatedTime,
      stages,
    });

    if (usage) {
      try {
        await recordUsage(uid, {
          requests: 1,
          inputTokens: usage.inputTokens,
          outputTokens: usage.outputTokens,
        });
      } catch {
        // metering is best-effort
      }
    }

    // Celebratory emails (fire-and-forget; gated by prefs + anti-spam).
    void notifyRoadmapReady(uid, {
      careerTitle: parsed.careerTitle,
      stageCount: stages.length,
      totalEstimatedTime,
    });
    void syncAchievements(uid);
    void recordMemoryEvent(uid, { type: "roadmap", title: `Roadmap generated: ${parsed.careerTitle}`, detail: `${stages.length} stages` });

    revalidatePath(ROUTES.roadmap);
    revalidatePath(ROUTES.dashboard);
    return { ok: true, id };
  } catch (error) {
    console.error("[roadmap] Unexpected failure:", error instanceof Error ? error.message : error);
    return { ok: false, error: "Something went wrong building your roadmap. Please try again." };
  }
}

export type UpdateMilestoneResult = { ok: true } | { ok: false; error: string };

/** Persist a milestone's progress status. */
export async function updateMilestoneStatus(input: unknown): Promise<UpdateMilestoneResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    const parsed = updateMilestoneSchema.parse(input);
    await setMilestoneStatus(decoded.uid, parsed.roadmapId, parsed.milestoneId, parsed.status);

    revalidatePath(ROUTES.roadmap);
    revalidatePath(ROUTES.dashboard);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save your progress. Please try again." };
  }
}
