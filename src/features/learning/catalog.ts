import type { LearningResource } from "./types";
import { normalizeCatalog } from "./service/query";
import rawResources from "@/data/learning-resources.json";

/*
 * Synchronous, JSON-backed view of the learning catalog.
 *
 * Resources are NOT hardcoded in TypeScript — they live in a structured data
 * source (`src/data/learning-resources.json`) that can be edited, extended, or
 * replaced without touching application code. This module normalizes that raw
 * data once into fully-typed records and exposes them synchronously for the
 * pure, offline analysis engines (careers + skill gap) that must stay sync.
 *
 * The Learning Hub page itself goes through the async, swappable
 * `LearningResourceService` (see ./service) so the storage layer can move to
 * Firestore / a CMS / an API with zero UI changes. The JSON provider is backed
 * by exactly this array, keeping a single source of truth.
 */
export const LEARNING_CATALOG: LearningResource[] = normalizeCatalog(
  rawResources as unknown[],
);

export const LEARNING_CATEGORIES: string[] = Array.from(
  new Set(LEARNING_CATALOG.map((r) => r.category)),
).sort();

export const CATALOG_BY_ID: Record<string, LearningResource> = LEARNING_CATALOG.reduce<
  Record<string, LearningResource>
>((acc, resource) => {
  acc[resource.id] = resource;
  return acc;
}, {});
