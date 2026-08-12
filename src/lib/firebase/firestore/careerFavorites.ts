import { adminDb, FieldValue } from "@/lib/firebase/admin";

// Repository for `users/{uid}/careerFavorites` (saved careers).

function favoritesRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("careerFavorites");
}

export async function getFavoriteSlugs(uid: string): Promise<string[]> {
  const snap = await favoritesRef(uid).get();
  return snap.docs.map((doc) => doc.id);
}

export async function addFavoriteCareer(uid: string, slug: string): Promise<void> {
  await favoritesRef(uid).doc(slug).set({ slug, savedAt: FieldValue.serverTimestamp() });
}

export async function removeFavoriteCareer(uid: string, slug: string): Promise<void> {
  await favoritesRef(uid).doc(slug).delete();
}
