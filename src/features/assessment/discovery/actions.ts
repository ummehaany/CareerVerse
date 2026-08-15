"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { upsertAssessmentDraft, finalizeAssessment } from "@/lib/firebase/firestore/assessments";
import { applyAssessmentToProfile } from "@/lib/firebase/firestore/careerProfiles";
import { setOnboardingComplete } from "@/lib/firebase/firestore/users";
import { saveCareerDiscovery } from "@/lib/firebase/firestore/careerDiscovery";
import { ROUTES } from "@/config/routes";
import { scoreCareerDiscovery } from "./scoring";
import { buildDiscoveryProfilePatch, buildDiscoveryStructuredProfile } from "./normalize";
import { TOTAL_BASIC_QUESTIONS } from "./questions";
import type { CareerMatch, DiscoveryAnswers } from "./types";

/*
 * Career Discovery server actions. Deliberately separate from
 * `../actions.ts` (the legacy assessment) — the answer shapes differ, and
 * keeping them apart means neither flow risks the other's validation rules.
 *
 * Persistence reuses the existing `users/{uid}/assessments` doc (via the
 * unmodified `upsertAssessmentDraft` / `finalizeAssessment` functions) so
 * every other module that already reads that collection keeps working, plus
 * one additive `careerDiscovery` field for the raw basic/advanced answers and
 * ranked recommendations.
 */

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

const answerValueSchema = z.union([z.string(), z.array(z.string()), z.number()]);
const answersSchema = z.record(z.string(), answerValueSchema);

const completeBasicSchema = z.object({
  answers: answersSchema,
  curiosityNote: z.string().max(300).optional(),
});

export type CompleteBasicResult =
  | { ok: true; assessmentId: string; recommendations: CareerMatch[] }
  | { ok: false; error: string };

/** Finalize the mandatory 20-question Core Career Discovery flow. */
export async function completeBasicDiscovery(input: unknown): Promise<CompleteBasicResult> {
  try {
    const uid = await requireUid();
    const parsed = completeBasicSchema.parse(input);
    const basicAnswers = parsed.answers as DiscoveryAnswers;

    const result = scoreCareerDiscovery(basicAnswers, null);
    const structured = buildDiscoveryStructuredProfile(basicAnswers, null, result.top, parsed.curiosityNote);
    const patch = buildDiscoveryProfilePatch(basicAnswers, null, result.top, parsed.curiosityNote);

    const { id } = await upsertAssessmentDraft(uid, {
      id: null,
      currentStep: TOTAL_BASIC_QUESTIONS,
      answers: basicAnswers,
    });

    await finalizeAssessment(uid, id, {
      answers: basicAnswers,
      currentStep: TOTAL_BASIC_QUESTIONS,
      structured,
      completionPercent: 100,
    });

    await saveCareerDiscovery(uid, id, {
      completed: true,
      basicAnswers,
      advancedAnswers: null,
      advancedCompleted: false,
      recommendations: result.top,
      curiosityNote: parsed.curiosityNote ?? null,
    });

    await applyAssessmentToProfile(uid, patch);
    await setOnboardingComplete(uid, true);

    revalidatePath(ROUTES.dashboard);
    revalidatePath(ROUTES.assessment);

    return { ok: true, assessmentId: id, recommendations: result.top };
  } catch (error) {
    return { ok: false, error: messageFor(error, "We couldn't save your results just now. Please try again.") };
  }
}

const completeAdvancedSchema = z.object({
  assessmentId: z.string().min(1),
  basicAnswers: answersSchema,
  advancedAnswers: answersSchema,
  curiosityNote: z.string().max(300).optional(),
});

export type CompleteAdvancedResult =
  | { ok: true; recommendations: CareerMatch[] }
  | { ok: false; error: string };

/** Refine the profile with the optional 30-question Deep assessment. */
export async function completeAdvancedDiscovery(input: unknown): Promise<CompleteAdvancedResult> {
  try {
    const uid = await requireUid();
    const parsed = completeAdvancedSchema.parse(input);
    const basicAnswers = parsed.basicAnswers as DiscoveryAnswers;
    const advancedAnswers = parsed.advancedAnswers as DiscoveryAnswers;

    const result = scoreCareerDiscovery(basicAnswers, advancedAnswers);
    const structured = buildDiscoveryStructuredProfile(basicAnswers, advancedAnswers, result.top, parsed.curiosityNote);
    const patch = buildDiscoveryProfilePatch(basicAnswers, advancedAnswers, result.top, parsed.curiosityNote);

    await finalizeAssessment(uid, parsed.assessmentId, {
      answers: basicAnswers,
      currentStep: TOTAL_BASIC_QUESTIONS,
      structured,
      completionPercent: 100,
    });

    await saveCareerDiscovery(uid, parsed.assessmentId, {
      completed: true,
      basicAnswers,
      advancedAnswers,
      advancedCompleted: true,
      recommendations: result.top,
      curiosityNote: parsed.curiosityNote ?? null,
    });

    await applyAssessmentToProfile(uid, patch);

    revalidatePath(ROUTES.dashboard);
    revalidatePath(ROUTES.assessment);

    return { ok: true, recommendations: result.top };
  } catch (error) {
    return { ok: false, error: messageFor(error, "We couldn't save your advanced results just now. Please try again.") };
  }
}
