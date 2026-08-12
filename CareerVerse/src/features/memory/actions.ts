"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { enforceRateLimit } from "@/lib/firebase/firestore/rate-limit";
import {
  addMemoryNote,
  deleteMemoryEvent,
  deleteMemoryNote,
  setHiddenField,
  setLearningStyle,
  setMemoryOverride,
} from "@/lib/firebase/firestore/memory";
import { buildMemoryProfile } from "@/lib/memory/service";
import { formatMemoryContext } from "@/lib/memory/context";
import { aiMemoryInsights } from "@/lib/ai/services/memory-insights";
import { HIDABLE_FIELDS, LEARNING_STYLES, type HidableField, type LearningStyle } from "@/lib/memory/types";
import { localMemoryInsights } from "@/features/memory/queries";
import { resetPersonalization } from "@/lib/firebase/firestore/account";
import { ROUTES } from "@/config/routes";

export type MemoryActionResult = { ok: true } | { ok: false; error: string };

const EXPIRED = "Your session has expired. Please sign in again." as const;

/* ── Edit facts ─────────────────────────────────────────────────────────────*/

export async function updateMemoryGoal(goal: string): Promise<MemoryActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    await setMemoryOverride(decoded.uid, "careerGoal", goal.trim().slice(0, 120) || null);
    revalidatePath(ROUTES.profile);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update your goal. Please try again." };
  }
}

export async function updateMemoryTargetCompany(company: string): Promise<MemoryActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    await setMemoryOverride(decoded.uid, "targetCompany", company.trim().slice(0, 120) || null);
    revalidatePath(ROUTES.profile);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update your target company. Please try again." };
  }
}

export async function updateMemoryLearningStyle(style: string): Promise<MemoryActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    const valid = LEARNING_STYLES.some((s) => s.value === style);
    if (!valid) return { ok: false, error: "Unknown learning style." };
    await setLearningStyle(decoded.uid, style as LearningStyle);
    revalidatePath(ROUTES.profile);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update your learning style. Please try again." };
  }
}

/* ── Notes ──────────────────────────────────────────────────────────────────*/

export async function addMemoryNoteAction(text: string): Promise<MemoryActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    const t = text.trim();
    if (!t) return { ok: false, error: "Write something to remember first." };
    await addMemoryNote(decoded.uid, t);
    revalidatePath(ROUTES.profile);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save that memory. Please try again." };
  }
}

export async function deleteMemoryNoteAction(id: string): Promise<MemoryActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    await deleteMemoryNote(decoded.uid, id);
    revalidatePath(ROUTES.profile);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't delete that memory. Please try again." };
  }
}

/* ── Privacy: hide fields, delete events, clear all ─────────────────────────*/

export async function toggleMemoryFieldHidden(field: string, hidden: boolean): Promise<MemoryActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    if (!HIDABLE_FIELDS.includes(field as HidableField)) return { ok: false, error: "Unknown field." };
    await setHiddenField(decoded.uid, field as HidableField, hidden);
    revalidatePath(ROUTES.profile);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't update that setting. Please try again." };
  }
}

export async function deleteMemoryEventAction(id: string): Promise<MemoryActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    await deleteMemoryEvent(decoded.uid, id);
    revalidatePath(ROUTES.profile);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't delete that event. Please try again." };
  }
}

export async function clearAllMemoryAction(): Promise<MemoryActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    await resetPersonalization(decoded.uid);
    for (const path of [ROUTES.profile, ROUTES.dashboard, ROUTES.settings, ROUTES.recommendations, ROUTES.roadmap, ROUTES.analytics]) {
      revalidatePath(path);
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't clear your memory. Please try again." };
  }
}

/* ── AI insights (AI when available, deterministic fallback otherwise) ──────*/

export type MemoryInsightsResult =
  | { ok: true; insights: string[]; source: "ai" | "offline" }
  | { ok: false; error: string };

export async function generateMemoryInsightsAction(): Promise<MemoryInsightsResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    const _rl = await enforceRateLimit(decoded.uid, "memory-insights", 8);
    if (!_rl.ok) return { ok: false, error: `You're doing that a lot. Please wait ${_rl.retryAfter}s and try again.` };

    const profile = await buildMemoryProfile(decoded.uid);
    try {
      const summary = formatMemoryContext(profile) || "No memory yet.";
      const insights = await aiMemoryInsights(summary);
      if (insights.length === 0) throw new Error("empty");
      return { ok: true, insights, source: "ai" };
    } catch {
      return { ok: true, insights: localMemoryInsights(profile), source: "offline" };
    }
  } catch {
    return { ok: false, error: "Couldn't generate insights right now. Please try again." };
  }
}
