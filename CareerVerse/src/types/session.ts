import type { UserRole, UserPlan } from "./user";

/**
 * The minimal, serializable slice of the user handed from the server layout to
 * client shell components. Firestore Timestamps stay on the server; only plain
 * primitives cross the RSC → client boundary.
 */
export interface SessionUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role: UserRole;
  plan: UserPlan;
}
