"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifySession, SESSION_COOKIE } from "@/lib/firebase/auth";
import { resetPersonalization, deleteAllUserData } from "@/lib/firebase/firestore/account";
import { ROUTES } from "@/config/routes";

export type AccountActionResult = { ok: true } | { ok: false; error: string };

const EXPIRED = "Your session has expired. Please sign in again." as const;

/**
 * True reset of all personalized data. Account, subscription, and notification
 * preferences are preserved; everything else is wiped and the onboarding gate
 * reopens so the user is prompted to start Career Discovery again.
 */
export async function resetPersonalizationAction(): Promise<AccountActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    await resetPersonalization(decoded.uid);
    // Refresh every surface that reads personalized data.
    for (const path of [ROUTES.dashboard, ROUTES.profile, ROUTES.settings, ROUTES.recommendations, ROUTES.roadmap, ROUTES.analytics, ROUTES.interviews]) {
      revalidatePath(path);
    }
    return { ok: true };
  } catch (error) {
    console.error("[account] reset failed:", error instanceof Error ? error.message : error);
    return { ok: false, error: "We couldn't reset your data. Please try again." };
  }
}

export type DeleteAccountActionResult =
  | { ok: true; authDeleted: boolean }
  | { ok: false; error: string };

/**
 * Permanently delete the account and all user-owned data, then clear the
 * session cookie. Requires the user to type DELETE (verified again server-side).
 */
export async function deleteAccountAction(confirmation: string): Promise<DeleteAccountActionResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: EXPIRED };
    if (confirmation.trim().toUpperCase() !== "DELETE") {
      return { ok: false, error: 'Please type "DELETE" to confirm.' };
    }

    const result = await deleteAllUserData(decoded.uid);
    if (!result.ok) {
      return { ok: false, error: "We couldn't fully delete your account. Please try again or contact support." };
    }

    // Sign out: clear the session cookie regardless of auth-delete outcome.
    const store = await cookies();
    store.set({ name: SESSION_COOKIE, value: "", maxAge: 0, path: "/" });

    return { ok: true, authDeleted: result.authDeleted };
  } catch (error) {
    console.error("[account] delete failed:", error instanceof Error ? error.message : error);
    return { ok: false, error: "We couldn't delete your account. Please try again." };
  }
}
