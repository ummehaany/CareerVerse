"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import {
  upsertAssessmentDraft,
  finalizeAssessment,
} from "@/lib/firebase/firestore/assessments";
import { applyAssessmentToProfile } from "@/lib/firebase/firestore/careerProfiles";
import { setOnboardingComplete } from "@/lib/firebase/firestore/users";
import { ROUTES } from "@/config/routes";
import { saveProgressSchema, completeAssessmentSchema } from "./schema";
import { validateAll } from "./validation";
import { buildStructuredProfile, buildProfilePatch } from "./normalize";

const UNAUTH = "UNAUTHENTICATED";

async function requireUid(): Promise<string> {
  const decoded = await verifySession();
  if (!decoded) throw new Error(UNAUTH);
  return decoded.uid;
}

function messageFor(error: unknown, fallback: string): string {
  return error instanceof Error && error.message === UNAUTH
    ? "Your session has expired. Please sign in again."
    : fallback;
}

export type SaveProgressResult = { ok: true; id: string } | { ok: false; error: string };

/** Autosave the in-progress draft. Returns the (possibly new) draft id. */
export async function saveAssessmentProgress(input: unknown): Promise<SaveProgressResult> {
  try {
    const uid = await requireUid();
    const parsed = saveProgressSchema.parse(input);
    const { id } = await upsertAssessmentDraft(uid, {
      id: parsed.id ?? null,
      currentStep: parsed.currentStep,
      answers: parsed.answers,
    });
    return { ok: true, id };
  } catch (error) {
    return { ok: false, error: messageFor(error, "We couldn't save your progress just now.") };
  }
}

export type CompleteAssessmentResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/**
 * Finalize the assessment: persist answers + derived structured profile, sync
 * the direct fields onto the career profile, and flip the onboarding gate.
 */
export async function completeAssessment(input: unknown): Promise<CompleteAssessmentResult> {
  try {
    const uid = await requireUid();
    const parsed = completeAssessmentSchema.parse(input);

    const fieldErrors = validateAll(parsed.answers);
    if (Object.keys(fieldErrors).length > 0) {
      return { ok: false, error: "Some answers still need your attention.", fieldErrors };
    }

    const { id } = await upsertAssessmentDraft(uid, {
      id: parsed.id ?? null,
      currentStep: parsed.currentStep,
      answers: parsed.answers,
    });

    const structured = buildStructuredProfile(parsed.answers);
    await finalizeAssessment(uid, id, {
      answers: parsed.answers,
      currentStep: parsed.currentStep,
      structured,
      completionPercent: 100,
    });

    await applyAssessmentToProfile(uid, buildProfilePatch(parsed.answers));
    await setOnboardingComplete(uid, true);

    revalidatePath(ROUTES.dashboard);
    revalidatePath(ROUTES.assessment);
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error: messageFor(error, "We couldn't submit your assessment. Please try again."),
    };
  }
}
