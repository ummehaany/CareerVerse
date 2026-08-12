/**
 * Privacy preference domain types. Mirrors the email-preferences pattern
 * (src/lib/email/types.ts) so both preference systems persist and normalize
 * the same way — one category maps to one Settings toggle.
 */

export type PrivacyCategory = "publicProfile" | "showActivity" | "discoverable" | "analytics";

/** Ordered list — drives preference UI and iteration. */
export const PRIVACY_CATEGORIES: PrivacyCategory[] = ["publicProfile", "showActivity", "discoverable", "analytics"];

/** User-facing metadata for each category (consumed by the Settings UI). */
export interface PrivacyCategoryMeta {
  category: PrivacyCategory;
  label: string;
  description: string;
}

export const PRIVACY_CATEGORY_META: Record<PrivacyCategory, PrivacyCategoryMeta> = {
  publicProfile: {
    category: "publicProfile",
    label: "Public profile",
    description: "Allow your CareerVerse profile link to be viewed by others.",
  },
  showActivity: {
    category: "showActivity",
    label: "Show activity",
    description: "Display streaks and achievements on your public profile.",
  },
  discoverable: {
    category: "discoverable",
    label: "Discoverable by recruiters",
    description: "Let verified recruiters find your profile in the future.",
  },
  analytics: {
    category: "analytics",
    label: "Usage analytics",
    description: "Help improve CareerVerse with anonymous usage data.",
  },
};

/** Default preferences for a new user — matches the toggles' original defaults. */
export function defaultPrivacyPreferences(): Record<PrivacyCategory, boolean> {
  return {
    publicProfile: false,
    showActivity: true,
    discoverable: false,
    analytics: true,
  };
}

/**
 * Normalize a possibly-partial stored preferences map into a complete one,
 * defaulting missing keys the same way a brand-new account would see them.
 */
export function normalizePrivacyPreferences(
  stored: Partial<Record<PrivacyCategory, boolean>> | undefined | null,
): Record<PrivacyCategory, boolean> {
  const base = defaultPrivacyPreferences();
  if (stored) {
    for (const cat of PRIVACY_CATEGORIES) {
      if (typeof stored[cat] === "boolean") base[cat] = stored[cat] as boolean;
    }
  }
  return base;
}
