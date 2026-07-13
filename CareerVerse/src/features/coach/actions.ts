"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/firebase/auth";
import { getLatestAssessment } from "@/lib/firebase/firestore/assessments";
import { getLatestRecommendationSet } from "@/lib/firebase/firestore/recommendations";
import { getLatestRoadmap } from "@/lib/firebase/firestore/roadmaps";
import { listCoachMessages, appendCoachMessage } from "@/lib/firebase/firestore/coach";
import { coachReply } from "@/lib/ai/services/career-coach";
import { recordUsage } from "@/lib/firebase/firestore/usage";
import { AIError } from "@/lib/ai/types";
import { ROUTES } from "@/config/routes";
import type { AssessmentDoc } from "@/types/assessment";
import type { RecommendationSetDoc } from "@/types/recommendation";
import type { RoadmapDoc } from "@/types/roadmap";

const schema = z.object({ content: z.string().min(1).max(2000) });

function buildContext(
  assessment: AssessmentDoc | null,
  recommendationSet: RecommendationSetDoc | null,
  roadmap: RoadmapDoc | null,
): string {
  const parts: string[] = [];
  const s = assessment?.structured;
  if (s) {
    if (s.interests.length) parts.push(`Interests: ${s.interests.join(", ")}`);
    if (s.technicalSkills.length) parts.push(`Technical skills: ${s.technicalSkills.join(", ")}`);
    if (s.strengths.length) parts.push(`Strengths: ${s.strengths.join(", ")}`);
    if (s.goals.horizon) parts.push(`Current focus: ${s.goals.horizon}`);
    if (s.goals.aspiration) parts.push(`Goal: ${s.goals.aspiration}`);
  }
  const top = recommendationSet?.recommendations?.[0];
  if (top) parts.push(`Top career match: ${top.title} (${top.matchPercentage}% fit)`);
  if (roadmap) parts.push(`Active learning roadmap toward: ${roadmap.careerTitle}`);
  return parts.join("\n");
}

export type SendCoachResult = { ok: true; reply: string } | { ok: false; error: string };

export async function sendCoachMessage(input: unknown): Promise<SendCoachResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };
    const uid = decoded.uid;

    const parsed = schema.parse(input);

    const [assessment, recommendationSet, roadmap, history] = await Promise.all([
      getLatestAssessment(uid),
      getLatestRecommendationSet(uid),
      getLatestRoadmap(uid),
      listCoachMessages(uid, 10),
    ]);

    const context = buildContext(assessment, recommendationSet, roadmap);
    const historyView = history.map((m) => ({ role: m.role, content: m.content }));

    await appendCoachMessage(uid, "user", parsed.content);
    const result = await coachReply(context, historyView, parsed.content);
    await appendCoachMessage(uid, "assistant", result.reply);

    try {
      await recordUsage(uid, {
        requests: 1,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
      });
    } catch {
      // metering best-effort
    }

    revalidatePath(ROUTES.coach);
    return { ok: true, reply: result.reply };
  } catch (error) {
    if (error instanceof AIError) {
      const message =
        error.code === "not_configured"
          ? "The AI coach isn't configured yet. Add a Gemini API key to enable it."
          : "The coach couldn't respond just now. Please try again.";
      return { ok: false, error: message };
    }
    return { ok: false, error: "Something went wrong. Please try again." };
  }
}
