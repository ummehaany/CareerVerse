import { cache } from "react";
import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { deriveUsername } from "@/lib/profile/identity";

/**
 * Username registry: `usernames/{username}` -> { uid }. Guarantees a unique,
 * URL-safe public handle per user and enables username -> uid resolution for
 * the public route. Reservation is transactional so two users can never claim
 * the same handle.
 */

const COLLECTION = "usernames";
const RESERVED = new Set(["u", "api", "admin", "settings", "login", "signup", "dashboard", "profile", "app", "about", "pricing"]);

function slugRef(username: string) {
  return adminDb.collection(COLLECTION).doc(username);
}

/** Resolve a public username to its owner uid (request-memoized). */
async function resolveUsername__impl(username: string): Promise<string | null> {
  const clean = username.trim().toLowerCase();
  if (!clean) return null;
  try {
    const snap = await slugRef(clean).get();
    return snap.exists ? ((snap.data()?.uid as string | undefined) ?? null) : null;
  } catch {
    return null;
  }
}
export const resolveUsername = cache(resolveUsername__impl);

function candidatesFor(base: string): string[] {
  const root = (base || "user").replace(/[^a-z0-9]/g, "").slice(0, 20) || "user";
  const safe = RESERVED.has(root) ? `${root}1` : root;
  const list = [safe];
  for (let i = 2; i <= 30; i++) list.push(`${root}${i}`);
  return list;
}

/**
 * Ensure the user has a reserved, unique username. Idempotent: returns the
 * existing handle if already reserved to this uid. Best-effort; falls back to a
 * uid-based handle if the registry is briefly unavailable.
 */
export async function ensureUsername(uid: string, displayName?: string | null, email?: string | null): Promise<string> {
  const base = deriveUsername({ displayName, email, uid });
  const userRef = adminDb.collection("users").doc(uid);

  try {
    const userSnap = await userRef.get();
    const existing = userSnap.data()?.username as string | undefined;
    if (existing) {
      // Verify the registry still points here; self-heal if missing.
      const regSnap = await slugRef(existing).get();
      if (regSnap.exists && regSnap.data()?.uid === uid) return existing;
    }

    for (const candidate of candidatesFor(base)) {
      const claimed = await adminDb.runTransaction(async (tx) => {
        const ref = slugRef(candidate);
        const snap = await tx.get(ref);
        if (snap.exists && snap.data()?.uid !== uid) return false;
        tx.set(ref, { uid, createdAt: FieldValue.serverTimestamp() }, { merge: true });
        tx.set(userRef, { username: candidate, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
        return true;
      });
      if (claimed) return candidate;
    }
    return base;
  } catch (error) {
    console.error("[username] ensureUsername failed:", error instanceof Error ? error.message : error);
    return base;
  }
}
