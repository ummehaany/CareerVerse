"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import {
  setTourCompleted,
  completeOnboarding,
  skipOnboarding,
  setOnboardingTourCompleted,
} from "@/lib/firebase/firestore/users";
import { seedDreamCompanies } from "@/lib/firebase/firestore/dreamCompanies";
import { getCompanyRecordByName } from "@/lib/companies/catalog";
import { z } from "zod";
import { ROUTES } from "@/config/routes";

export type OnboardingResult = { ok: true } | { ok: false };

/** Persist that the user has finished (or skipped) the product tour. */
export async function completeTourAction(): Promise<OnboardingResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false };
    await setTourCompleted(decoded.uid, true);
    try {
      await setOnboardingTourCompleted(decoded.uid, true);
    } catch {
      // Non-fatal: the tour gate uses tourCompletedAt; this only mirrors it.
    }
    revalidatePath(ROUTES.dashboard);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/** Reset the tour so it shows again on next load (used for testing/QA). */
export async function resetTourAction(): Promise<OnboardingResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false };
    await setTourCompleted(decoded.uid, false);
    revalidatePath(ROUTES.dashboard);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

// ── First-run personalization onboarding (Steps 1–6) ────────────────────────

const onboardingSchema = z.object({
  careerGoal: z.string().trim().min(1).max(60).nullable(),
  careerField: z.string().trim().min(1).max(80).nullable(),
  currentLevel: z.string().trim().min(1).max(60).nullable(),
  targetCompanies: z.array(z.string().trim().min(1).max(60)).max(30),
});

/** Persist the personalization answers and mark onboarding complete. */
export async function completeOnboardingAction(input: unknown): Promise<OnboardingResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false };
    const parsed = onboardingSchema.safeParse(input);
    if (!parsed.success) return { ok: false };
    await completeOnboarding(decoded.uid, parsed.data);

    // Connect "which companies are you targeting?" to the existing Target
    // Companies feature: seed the student's dream-company list from whichever
    // picks match the company catalog. Only fills an empty list — never
    // overrides a choice already made in Target Companies.
    const matchedSlugs = parsed.data.targetCompanies
      .map((name) => getCompanyRecordByName(name)?.slug ?? null)
      .filter((slug): slug is string => Boolean(slug));
    if (matchedSlugs.length > 0) {
      await seedDreamCompanies(decoded.uid, matchedSlugs).catch(() => {
        // Non-fatal: onboarding is already saved; Target Companies still works manually.
      });
    }

    revalidatePath("/", "layout");
    revalidatePath(ROUTES.dashboard);
    revalidatePath(ROUTES.companies);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/** Mark onboarding complete with no personalization (user chose "Skip setup"). */
export async function skipOnboardingAction(): Promise<OnboardingResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false };
    await skipOnboarding(decoded.uid);
    revalidatePath("/", "layout");
    revalidatePath(ROUTES.dashboard);
    return { ok: true };
  } catch {
    return { ok: false };
  }
}
