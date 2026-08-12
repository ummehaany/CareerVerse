import { adminDb, FieldValue } from "@/lib/firebase/admin";

const COLLECTION = "rateLimits";

export interface RateLimitResult {
  ok: boolean;
  /** Seconds until the window resets (0 when allowed). */
  retryAfter: number;
}

/**
 * Per-user, per-action fixed-window rate limiter for expensive endpoints (AI
 * generation). Backed by a single Firestore doc per user (`rateLimits/{uid}`)
 * with one counter per bucket, updated atomically in a transaction. Fails open
 * (allows the request) if the limiter itself errors, so it never hard-blocks a
 * legitimate user due to infrastructure hiccups.
 */
export async function enforceRateLimit(
  uid: string,
  bucket: string,
  limit: number,
  windowMs = 60_000,
): Promise<RateLimitResult> {
  const ref = adminDb.collection(COLLECTION).doc(uid);
  const now = Date.now();

  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = (snap.exists ? snap.data() : {}) ?? {};
      const prev = data[bucket] as { count: number; windowStart: number } | undefined;

      const inWindow = prev && now - prev.windowStart < windowMs;
      const count = inWindow ? prev.count + 1 : 1;
      const windowStart = inWindow ? prev.windowStart : now;

      tx.set(
        ref,
        { [bucket]: { count, windowStart }, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      );

      const ok = count <= limit;
      const retryAfter = ok ? 0 : Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000));
      return { ok, retryAfter };
    });
  } catch {
    return { ok: true, retryAfter: 0 };
  }
}
