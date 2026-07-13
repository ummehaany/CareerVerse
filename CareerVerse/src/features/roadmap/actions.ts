"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { saveRoadmap, setMilestoneStatus } from "@/lib/firebase/firestore/roadmaps";
import { recordUsage } from "@/lib/firebase/firestore/usage";
import { generateRoadmap as generateRoadmapAI } from "@/lib/ai/services/roadmap-generator";
import { AIError } from "@/lib/ai/types";
import { ROUTES } from "@/config/routes";
import { generateRoadmapSchema, updateMilestoneSchema } from "./schema";

export type GenerateRoadmapResult = { ok: true; id: string } | { ok: false; error: string };

function messageForAIError(error: AIError): string {
  switch (error.code) {
    case "not_configured":
      return "AI roadmaps aren't configured yet. Add a Gemini API key to enable them.";
    case "insufficient_input":
      return "There isn't enough assessment data yet — retake the assessment with more detail.";
    case "schema_mismatch":
    case "invalid_json":
    case "empty_response":
      return "The AI returned an unexpected response. Please try generating again.";
    default:
      return "The AI couldn't build your roadmap just now. Please try again.";
  }
}

/** Generate and persist a roadmap for the selected career. */
export async function generateRoadmap(input: unknown): Promise<GenerateRoadmapResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };
    const uid = decoded.uid;

    const parsed = generateRoadmapSchema.parse(input);

    const assessment = await getLatestAssessment(uid);
    if (!assessment || assessment.status !== "completed" || !assessment.structured) {
      return { ok: false, error: "Complete your career assessment first to build a roadmap." };
    }

    const result = await generateRoadmapAI(parsed.careerTitle, assessment.structured);

    const { id } = await saveRoadmap(uid, {
      careerTitle: parsed.careerTitle,
      assessmentId: assessment.id,
      provider: result.provider,
      model: result.model,
      overview: result.overview,
      totalEstimatedTime: result.totalEstimatedTime,
      stages: result.stages,
    });

    try {
      await recordUsage(uid, {
        requests: 1,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });
    } catch {
      // metering is best-effort
    }

    revalidatePath(ROUTES.roadmap);
    revalidatePath(ROUTES.dashboard);
    return { ok: true, id };
  } catch (error) {
    if (error instanceof AIError) return { ok: false, error: messageForAIError(error) };
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
