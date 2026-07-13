import { adminDb, FieldValue } from "@/lib/firebase/admin";
import type { CareerInsights } from "@/lib/careers/types";

// Career-general AI insights, cached top-level and shared across users.
// Read/written server-side via the Admin SDK only.
const COLLECTION = "careerInsights";

export async function getCareerInsights(slug: string): Promise<CareerInsights | null> {
  const snap = await adminDb.collection(COLLECTION).doc(slug).get();
  if (!snap.exists) return null;
  const data = snap.data() as CareerInsights & { slug?: string };
  return {
    dayInLife: data.dayInLife,
    insights: data.insights,
    recommendedProjects: data.recommendedProjects,
    learningPath: data.learningPath,
    outlook: data.outlook,
  };
}

export async function saveCareerInsights(slug: string, insights: CareerInsights): Promise<void> {
  await adminDb
    .collection(COLLECTION)
    .doc(slug)
    .set({ ...insights, slug, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}
