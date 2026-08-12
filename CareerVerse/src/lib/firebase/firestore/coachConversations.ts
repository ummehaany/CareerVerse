import { adminDb, FieldValue } from "@/lib/firebase/admin";
import type { FirestoreTimestamp } from "@/types/user";

/*
 * Repository for `users/{uid}/coachConversations/{id}` — the Career Coach's
 * multi-conversation history (title, pinned flag, message turns). Slugs/ids are
 * client-generated so saves are idempotent upserts.
 */

interface StoredTurn {
  role: "user" | "assistant";
  content: string;
}

export interface CoachConversationDoc {
  id: string;
  title: string;
  pinned: boolean;
  messages: StoredTurn[];
  updatedAt: FirestoreTimestamp | null;
}

const LIST_CAP = 40;
const MSG_CAP = 200;

function ref(uid: string) {
  return adminDb.collection("users").doc(uid).collection("coachConversations");
}

export async function listConversations(uid: string, max = LIST_CAP): Promise<CoachConversationDoc[]> {
  const snap = await ref(uid).orderBy("updatedAt", "desc").limit(max).get();
  return snap.docs.map((doc) => {
    const d = doc.data() as Partial<CoachConversationDoc>;
    return {
      id: doc.id,
      title: d.title ?? "New conversation",
      pinned: d.pinned ?? false,
      messages: Array.isArray(d.messages) ? d.messages.slice(-MSG_CAP) : [],
      updatedAt: d.updatedAt ?? null,
    };
  });
}

export interface UpsertConversationInput {
  id: string;
  title: string;
  pinned: boolean;
  messages: StoredTurn[];
}

export async function upsertConversation(uid: string, input: UpsertConversationInput): Promise<void> {
  await ref(uid)
    .doc(input.id)
    .set(
      {
        title: input.title.slice(0, 120),
        pinned: input.pinned,
        messages: input.messages.slice(-MSG_CAP),
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
}

export async function setConversationPinned(uid: string, id: string, pinned: boolean): Promise<void> {
  await ref(uid).doc(id).set({ pinned, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}

export async function deleteConversation(uid: string, id: string): Promise<void> {
  await ref(uid).doc(id).delete();
}
