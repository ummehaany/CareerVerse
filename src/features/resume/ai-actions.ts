"use server";

import { verifySession } from "@/lib/firebase/auth";
import { enforceRateLimit } from "@/lib/firebase/firestore/rate-limit";
import { consumeFeature } from "@/lib/firebase/firestore/subscription";
import { recordUsage } from "@/lib/firebase/firestore/usage";
import type { ResumeData } from "@/types/resume";
import { resumeDataSchema } from "./schema";
import { computeAtsScore } from "./ats";
import {
  aiSummary,
  aiImproveBullets,
  aiSuggestSkills,
  aiImproveText,
  aiAtsTips,
  localSummary,
  localImproveBullets,
  localSuggestSkills,
  localImproveText,
} from "@/lib/ai/services/resume-assistant";
import { buildMemoryContext } from "@/lib/memory/context";
import { addMemoryRecommendation } from "@/lib/firebase/firestore/memory";

export type ResumeAssistTask =
  | "summary"
  | "suggestSkills"
  | "improveBullets"
  | "improveText"
  | "ats";

export interface ResumeAssistInput {
  task: ResumeAssistTask;
  resume: ResumeData;
  /** For improveText. */
  text?: string;
  /** For improveBullets. */
  experienceId?: string;
}

export type ResumeAssistResult =
  | { ok: true; kind: "text"; text: string; source: "ai" | "offline" }
  | { ok: true; kind: "list"; items: string[]; source: "ai" | "offline" }
  | { ok: false; error: string; limitReached?: boolean; feature?: string };

function logAi(label: string, error: unknown) {
  console.error(`[resume-ai] ${label} unavailable; using offline fallback:`, error instanceof Error ? error.message : error);
}

/**
 * Single entry point for the AI Resume Assistant. Always returns a useful
 * result: it tries the AI provider and silently falls back to deterministic
 * local logic when AI is unavailable or errors — the user never sees a failure.
 */
export async function runResumeAssist(input: ResumeAssistInput): Promise<ResumeAssistResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };
    const _rl = await enforceRateLimit(decoded.uid, "resume-assist", 15);
    if (!_rl.ok) return { ok: false, error: `You're doing that a lot. Please wait ${_rl.retryAfter}s and try again.` };

    const _lim = await consumeFeature(decoded.uid, "resumeAI");
    if (!_lim.allowed) return { ok: false, error: "You've reached your monthly Resume AI limit.", limitReached: true, feature: "resumeAI" };
    // Validate/normalize the resume payload defensively.
    const resume = resumeDataSchema.parse(input.resume) as ResumeData;
    const memory = await buildMemoryContext(decoded.uid).catch(() => "");

    switch (input.task) {
      case "summary": {
        try {
          const text = await aiSummary(resume, memory);
          if (!text) throw new Error("empty");
          void recordUsage(decoded.uid, { requests: 1, inputTokens: 0, outputTokens: 0 }).catch(() => {});
          return { ok: true, kind: "text", text, source: "ai" };
        } catch (e) {
          logAi("summary", e);
          return { ok: true, kind: "text", text: localSummary(resume), source: "offline" };
        }
      }
      case "improveText": {
        const text = (input.text ?? "").trim();
        if (!text) return { ok: false, error: "There's no text to improve yet." };
        try {
          const out = await aiImproveText(text);
          if (!out) throw new Error("empty");
          return { ok: true, kind: "text", text: out, source: "ai" };
        } catch (e) {
          logAi("improveText", e);
          return { ok: true, kind: "text", text: localImproveText(text), source: "offline" };
        }
      }
      case "improveBullets": {
        const exp = resume.experience.find((x) => x.id === input.experienceId);
        const bullets = (exp?.bullets ?? []).map((b) => b.trim()).filter(Boolean);
        if (bullets.length === 0) return { ok: false, error: "Add a few highlights first, then improve them." };
        try {
          const items = await aiImproveBullets(exp?.role ?? "", bullets, memory);
          if (items.length === 0) throw new Error("empty");
          return { ok: true, kind: "list", items, source: "ai" };
        } catch (e) {
          logAi("improveBullets", e);
          return { ok: true, kind: "list", items: localImproveBullets(bullets), source: "offline" };
        }
      }
      case "suggestSkills": {
        try {
          const items = await aiSuggestSkills(resume);
          if (items.length === 0) throw new Error("empty");
          return { ok: true, kind: "list", items, source: "ai" };
        } catch (e) {
          logAi("suggestSkills", e);
          return { ok: true, kind: "list", items: localSuggestSkills(resume), source: "offline" };
        }
      }
      case "ats": {
        try {
          const items = await aiAtsTips(resume, memory);
          if (items.length === 0) throw new Error("empty");
          if (items[0]) void addMemoryRecommendation(decoded.uid, items[0], "resume");
          return { ok: true, kind: "list", items, source: "ai" };
        } catch (e) {
          logAi("ats", e);
          return { ok: true, kind: "list", items: computeAtsScore(resume).suggestions, source: "offline" };
        }
      }
      default:
        return { ok: false, error: "Unknown assistant action." };
    }
  } catch {
    return { ok: false, error: "The assistant is unavailable right now. Please try again." };
  }
}
