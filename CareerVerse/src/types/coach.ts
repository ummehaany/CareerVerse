import type { FirestoreTimestamp } from "./user";

export type CoachRole = "user" | "assistant";

/** `users/{uid}/coachMessages/{id}` — a single chat message. */
export interface CoachMessageDoc {
  id: string;
  role: CoachRole;
  content: string;
  createdAt: FirestoreTimestamp | null;
}

/** Serializable message for the client. */
export interface CoachMessageView {
  role: CoachRole;
  content: string;
}
