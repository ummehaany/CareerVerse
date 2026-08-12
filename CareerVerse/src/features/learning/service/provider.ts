import type { LearningResource } from "../types";

/**
 * Storage-agnostic contract for learning resources.
 *
 * The query layer and UI depend only on this interface, never on a concrete
 * store. Swapping JSON → Firestore → Supabase → a headless CMS → an external
 * API means providing a different implementation of this interface and nothing
 * else. Reads are required; the admin-facing writes are optional so read-only
 * providers (like the bundled JSON) can omit them.
 */
export interface LearningResourceProvider {
  /** Stable identifier, used for logging and fallback decisions. */
  readonly name: string;
  listResources(): Promise<LearningResource[]>;
  getResource(id: string): Promise<LearningResource | null>;
  upsertResource?(resource: LearningResource): Promise<void>;
  deleteResource?(id: string): Promise<void>;
}
