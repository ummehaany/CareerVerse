"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/firebase/auth";
import { setEmailPreference, setPrivacyPreference } from "@/lib/firebase/firestore/users";
import { EMAIL_CATEGORY_META, type EmailCategory } from "@/lib/email/types";
import { PRIVACY_CATEGORY_META, type PrivacyCategory } from "@/lib/privacy/types";
import { ROUTES } from "@/config/routes";

export type UpdateEmailPreferenceResult = { ok: true } | { ok: false; error: string };

/**
 * Persist a single email-notification preference. Critical categories
 * (welcome, Pro activation) are always on and cannot be toggled off.
 */
export async function updateEmailPreference(
  category: EmailCategory,
  enabled: boolean,
): Promise<UpdateEmailPreferenceResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    const meta = EMAIL_CATEGORY_META[category];
    if (!meta) return { ok: false, error: "Unknown preference." };
    if (!meta.togglable) return { ok: false, error: "This email is always on." };

    await setEmailPreference(decoded.uid, category, enabled);
    revalidatePath(ROUTES.settings);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save your preference. Please try again." };
  }
}

export type UpdatePrivacyPreferenceResult = { ok: true } | { ok: false; error: string };

/** Persist a single Privacy preference toggle. */
export async function updatePrivacyPreference(
  category: PrivacyCategory,
  enabled: boolean,
): Promise<UpdatePrivacyPreferenceResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    if (!PRIVACY_CATEGORY_META[category]) return { ok: false, error: "Unknown preference." };

    await setPrivacyPreference(decoded.uid, category, enabled);
    revalidatePath(ROUTES.settings);
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't save your preference. Please try again." };
  }
}
