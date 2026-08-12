import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase/admin";
import { getUser } from "@/lib/firebase/firestore/users";
import type { User } from "@/types";

// Server-only session helpers built on the Firebase session cookie.

/** Firebase reserves the `__session` cookie name for hosting/CDN compatibility. */
export const SESSION_COOKIE = "__session";
/** Session lifetime in seconds (5 days). */
export const SESSION_MAX_AGE = 60 * 60 * 24 * 5;

/** Exchange a freshly minted ID token for a long-lived session cookie. */
export async function createSessionCookie(idToken: string): Promise<string> {
  return adminAuth.createSessionCookie(idToken, { expiresIn: SESSION_MAX_AGE * 1000 });
}

async function readSessionCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/** Verify the current request's session cookie. Returns the decoded claims or null. */
export async function verifySession() {
  const cookie = await readSessionCookie();
  if (!cookie) return null;
  try {
    return await adminAuth.verifySessionCookie(cookie, true);
  } catch {
    return null;
  }
}

/** Resolve the authenticated user's Firestore document, or null if not signed in. */
export async function getCurrentUser(): Promise<User | null> {
  const decoded = await verifySession();
  if (!decoded) return null;
  return getUser(decoded.uid);
}
