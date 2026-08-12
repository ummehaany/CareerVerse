"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/firebase/auth";
import { adminAuth } from "@/lib/firebase/admin";
import { updateUserProfile } from "@/lib/firebase/firestore/users";
import { ROUTES } from "@/config/routes";
import { DISPLAY_NAME_MIN, DISPLAY_NAME_MAX } from "./constants";

/**
 * Validation for the editable profile fields. The display name is required when
 * present (no empty names) and length-bounded. `photoURL` accepts an https URL
 * (a Firebase Storage download URL) or null to remove the avatar. Email and any
 * auth credential are intentionally out of scope — this only edits the profile.
 */
const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(DISPLAY_NAME_MIN, `Name must be at least ${DISPLAY_NAME_MIN} characters.`)
    .max(DISPLAY_NAME_MAX, `Name must be ${DISPLAY_NAME_MAX} characters or fewer.`)
    .optional(),
  photoURL: z.union([z.string().url(), z.null()]).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateProfileResult =
  | { ok: true; displayName?: string; photoURL?: string | null }
  | { ok: false; error: string };

/**
 * Persist profile identity changes (display name and/or avatar). Writes to the
 * Firestore user document (the app's source of truth for identity) and mirrors
 * the change onto the Firebase Auth user record on a best-effort basis so the
 * two never drift. Revalidates the root layout so the avatar and name update
 * everywhere — nav, dashboard, profile, public profile, AI mentor — with no
 * sign-out required.
 */
export async function updateProfile(input: unknown): Promise<UpdateProfileResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    const parsed = updateProfileSchema.safeParse(input);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid profile details." };
    }

    const { displayName, photoURL } = parsed.data;
    if (displayName === undefined && photoURL === undefined) {
      return { ok: false, error: "Nothing to update." };
    }

    await updateUserProfile(decoded.uid, { displayName, photoURL });

    // Mirror onto the Auth record so token-derived identity stays in sync.
    try {
      await adminAuth.updateUser(decoded.uid, {
        ...(displayName !== undefined ? { displayName } : {}),
        ...(photoURL !== undefined ? { photoURL: photoURL ?? null } : {}),
      });
    } catch {
      // Non-fatal: Firestore is the source of truth the UI reads from.
    }

    // Refresh every authenticated route (shell + pages read the user doc).
    revalidatePath("/", "layout");
    revalidatePath(ROUTES.settings);
    revalidatePath(ROUTES.dashboard);
    revalidatePath(ROUTES.profile);

    return { ok: true, displayName, photoURL };
  } catch {
    return { ok: false, error: "Couldn't save your changes. Please try again." };
  }
}
