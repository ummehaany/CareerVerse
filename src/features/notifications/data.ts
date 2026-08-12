export interface AppNotification {
  id: string;
  title: string;
  body: string;
  href: string;
  icon: string;
  time: string;
  read: boolean;
}

export const NOTIFICATIONS_STORAGE_KEY = "cv-notifications";

/**
 * There is no real notification event source yet (no backend/event system
 * generates these). Keep this empty rather than seeding fabricated activity —
 * the shape below is kept so a real backend can populate it later without
 * changing the UI.
 */
export const DEFAULT_NOTIFICATIONS: AppNotification[] = [];

/**
 * IDs of the old hardcoded/fabricated notifications that used to be seeded
 * into localStorage before this was fixed. Users who opened the app prior to
 * the fix may still have these persisted under NOTIFICATIONS_STORAGE_KEY.
 * Used purely to clean up that stale data on load — matched by ID only, so
 * any real notification (which won't use these IDs) is left untouched.
 */
export const LEGACY_FABRICATED_NOTIFICATION_IDS: ReadonlySet<string> = new Set([
  "n-matches",
  "n-interview",
  "n-resume",
  "n-dream",
  "n-achievement",
  "n-skillgap",
]);
