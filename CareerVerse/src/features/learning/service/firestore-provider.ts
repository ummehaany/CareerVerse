import type { LearningResource } from "../types";
import type { LearningResourceProvider } from "./provider";
import {
  listLearningResources,
  getLearningResource,
  upsertLearningResource,
  deleteLearningResource,
} from "@/lib/firebase/firestore/learningResources";

/**
 * Provider backed by the top-level `learningResources` Firestore collection.
 * Enabled with LEARNING_RESOURCE_PROVIDER=firestore. Supports admin writes, so
 * a future admin dashboard can add / edit / remove / feature resources with no
 * code change. Seed the collection from src/data/learning-resources.json.
 */
export class FirestoreLearningResourceProvider implements LearningResourceProvider {
  readonly name = "firestore";

  listResources(): Promise<LearningResource[]> {
    return listLearningResources();
  }

  getResource(id: string): Promise<LearningResource | null> {
    return getLearningResource(id);
  }

  upsertResource(resource: LearningResource): Promise<void> {
    return upsertLearningResource(resource);
  }

  deleteResource(id: string): Promise<void> {
    return deleteLearningResource(id);
  }
}
