import type { LearningResource } from "../types";
import type { LearningResourceProvider } from "./provider";
import { LEARNING_CATALOG, CATALOG_BY_ID } from "../catalog";

/**
 * Read-only provider backed by the bundled JSON catalog. This is the zero-config
 * default: the app works out of the box with no database, and the very same data
 * feeds the offline analysis engines. Editing resources = editing the JSON file.
 */
export class JsonLearningResourceProvider implements LearningResourceProvider {
  readonly name = "json";

  async listResources(): Promise<LearningResource[]> {
    return LEARNING_CATALOG;
  }

  async getResource(id: string): Promise<LearningResource | null> {
    return CATALOG_BY_ID[id] ?? null;
  }
}
