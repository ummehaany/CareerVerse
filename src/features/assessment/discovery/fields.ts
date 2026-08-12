import type { FieldDefinition, FieldId } from "./types";

/*
 * The 9 broad career "worlds" shown in the field-interest question.
 *
 * Each one maps to the *real* `Career.category` values already present in
 * `lib/careers/catalog.ts` (verified: Technology, Data & AI, Healthcare,
 * Engineering, Architecture & Built, Aviation & Transport, Business, Finance,
 * Product & Management, Hospitality, Law & Public, Education, Design,
 * Marketing & Media, Science — all 15 categories are covered below, so every
 * career in the catalog is reachable through this taxonomy). This is the
 * layer that makes the assessment "broad" instead of "tech + business only":
 * questions assign weight to these 9 fields, not to individual careers.
 */
export const FIELDS: FieldDefinition[] = [
  {
    id: "technology",
    label: "Technology & Data",
    categories: ["Technology", "Data & AI"],
  },
  {
    id: "healthcare",
    label: "Healthcare & Medicine",
    categories: ["Healthcare"],
  },
  {
    id: "engineering",
    label: "Engineering & Built Environment",
    categories: ["Engineering", "Architecture & Built", "Aviation & Transport"],
  },
  {
    id: "business",
    label: "Business, Finance & Management",
    categories: ["Business", "Finance", "Product & Management", "Hospitality"],
  },
  {
    id: "law_public",
    label: "Law & Public Service",
    categories: ["Law & Public"],
  },
  {
    id: "education",
    label: "Education & Teaching",
    categories: ["Education"],
  },
  {
    id: "design_creative",
    label: "Design & Creative Arts",
    categories: ["Design"],
  },
  {
    id: "media_communication",
    label: "Media & Communication",
    categories: ["Marketing & Media"],
  },
  {
    id: "science",
    label: "Science & Research",
    categories: ["Science"],
  },
];

export const FIELDS_BY_ID: Record<FieldId, FieldDefinition> = FIELDS.reduce(
  (acc, f) => {
    acc[f.id] = f;
    return acc;
  },
  {} as Record<FieldId, FieldDefinition>,
);

/** Real catalog category (e.g. "Healthcare") → our field id (e.g. "healthcare"). */
export const CATEGORY_TO_FIELD: Record<string, FieldId> = FIELDS.reduce(
  (acc, f) => {
    f.categories.forEach((c) => {
      acc[c] = f.id;
    });
    return acc;
  },
  {} as Record<string, FieldId>,
);

export function fieldForCategory(category: string): FieldId | null {
  return CATEGORY_TO_FIELD[category] ?? null;
}
