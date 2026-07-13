import { adminDb, FieldValue } from "@/lib/firebase/admin";

const COLLECTION = "usage";

function currentPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export interface UsageDelta {
  requests?: number;
  inputTokens?: number;
  outputTokens?: number;
}

/**
 * Record AI usage for metering (architecture §12). Cost accounting is written
 * after each call; this is intentionally best-effort and never blocks a feature.
 */
export async function recordUsage(uid: string, delta: UsageDelta): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(uid)
    .set(
      {
        period: currentPeriod(),
        requests: FieldValue.increment(delta.requests ?? 1),
        tokensIn: FieldValue.increment(delta.inputTokens ?? 0),
        tokensOut: FieldValue.increment(delta.outputTokens ?? 0),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}
