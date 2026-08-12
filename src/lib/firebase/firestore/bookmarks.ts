import { adminDb, FieldValue } from "@/lib/firebase/admin";

// Repository for `users/{uid}/bookmarks` (saved learning resources).

function bookmarksRef(uid: string) {
  return adminDb.collection("users").doc(uid).collection("bookmarks");
}

export async function getBookmarkedIds(uid: string): Promise<string[]> {
  const snap = await bookmarksRef(uid).get();
  return snap.docs.map((doc) => doc.id);
}

export async function addBookmark(uid: string, resourceId: string): Promise<void> {
  await bookmarksRef(uid).doc(resourceId).set({
    resourceId,
    savedAt: FieldValue.serverTimestamp(),
  });
}

export async function removeBookmark(uid: string, resourceId: string): Promise<void> {
  await bookmarksRef(uid).doc(resourceId).delete();
}
