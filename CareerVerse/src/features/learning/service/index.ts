import { cache } from "react";
import { serverEnv } from "@/lib/env.server";
import type { LearningResource } from "../types";
import type { LearningResourceProvider } from "./provider";
import { JsonLearningResourceProvider } from "./json-provider";
import { FirestoreLearningResourceProvider } from "./firestore-provider";

/**
 * LearningResourceService — the single seam between the app and the storage
 * layer. The provider is chosen once from configuration; the rest of the app
 * only ever calls the exported helpers, so moving to Firestore / a CMS / an API
 * is a one-line config change (LEARNING_RESOURCE_PROVIDER) plus one provider.
 */
let cachedProvider: LearningResourceProvider | null = null;

export function getLearningResourceProvider(): LearningResourceProvider {
  if (cachedProvider) return cachedProvider;
  cachedProvider =
    serverEnv.LEARNING_RESOURCE_PROVIDER === "firestore"
      ? new FirestoreLearningResourceProvider()
      : new JsonLearningResourceProvider();
  return cachedProvider;
}

/**
 * Load every resource for the current request. Adds a safe fallback to the
 * bundled JSON so a misconfigured or empty remote store never breaks the page,
 * and is request-memoized via React `cache()` so multiple consumers in one
 * render share a single read.
 */
async function loadResources(): Promise<LearningResource[]> {
  const provider = getLearningResourceProvider();
  try {
    const resources = await provider.listResources();
    if (resources.length > 0) return resources;
  } catch (error) {
    console.error(`[learning] provider "${provider.name}" failed; falling back to JSON`, error);
  }
  if (provider.name !== "json") {
    return new JsonLearningResourceProvider().listResources();
  }
  return [];
}

export const getAllResources = cache(loadResources);

export async function getResourceById(id: string): Promise<LearningResource | null> {
  const provider = getLearningResourceProvider();
  try {
    return await provider.getResource(id);
  } catch {
    return new JsonLearningResourceProvider().getResource(id);
  }
}

export type { LearningResourceProvider } from "./provider";
