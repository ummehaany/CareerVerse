import { adminDb, FieldValue } from "@/lib/firebase/admin";
import { PORTFOLIO_VERSION, type Portfolio, type PortfolioDoc } from "@/types/portfolio";

const COLLECTION = "portfolios";

/** Read the saved portfolio for a user (null when they haven't created one). */
export async function getPortfolio(uid: string): Promise<PortfolioDoc | null> {
  const snap = await adminDb.collection(COLLECTION).doc(uid).get();
  return snap.exists ? (snap.data() as PortfolioDoc) : null;
}

/**
 * Create or update the user's portfolio. The full editable payload is written
 * with merge so the stored doc always mirrors the editor state, while
 * timestamps and schema version are maintained server-side.
 */
export async function savePortfolio(uid: string, data: Portfolio): Promise<void> {
  const ref = adminDb.collection(COLLECTION).doc(uid);
  const snap = await ref.get();
  await ref.set(
    {
      uid,
      ...data,
      schemaVersion: PORTFOLIO_VERSION,
      ...(snap.exists ? {} : { createdAt: FieldValue.serverTimestamp() }),
      updatedAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
}
