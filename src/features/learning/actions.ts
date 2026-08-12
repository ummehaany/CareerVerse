"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession } from "@/lib/firebase/auth";
import { addBookmark, removeBookmark } from "@/lib/firebase/firestore/bookmarks";
import { CATALOG_BY_ID } from "./catalog";
import { ROUTES } from "@/config/routes";

const toggleSchema = z.object({
  resourceId: z.string().min(1),
  bookmarked: z.boolean(),
});

export type ToggleBookmarkResult = { ok: true; bookmarked: boolean } | { ok: false; error: string };

/** Add or remove a saved resource. `bookmarked` is the desired next state. */
export async function toggleBookmark(input: unknown): Promise<ToggleBookmarkResult> {
  try {
    const decoded = await verifySession();
    if (!decoded) return { ok: false, error: "Your session has expired. Please sign in again." };

    const parsed = toggleSchema.parse(input);
    if (!CATALOG_BY_ID[parsed.resourceId]) {
      return { ok: false, error: "Unknown resource." };
    }

    if (parsed.bookmarked) {
      await addBookmark(decoded.uid, parsed.resourceId);
    } else {
      await removeBookmark(decoded.uid, parsed.resourceId);
    }

    revalidatePath(ROUTES.learning);
    return { ok: true, bookmarked: parsed.bookmarked };
  } catch {
    return { ok: false, error: "Couldn't update your saved resources. Please try again." };
  }
}
