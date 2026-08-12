/**
 * Pure eligibility predicates for the reminder-style email triggers, kept
 * dependency-free (no Firestore/Admin SDK imports) so the actual decision
 * logic is unit-testable in isolation from the rest of the server stack.
 */
const NEW_ACCOUNT_GRACE_MS = 24 * 3_600_000;
const INACTIVITY_THRESHOLD_MS = 7 * 86_400_000;

/** True when the account is too new to nudge yet (avoids Day-0 pile-on). */
export function isTooNewForReminder(createdMs: number, now: number): boolean {
  return createdMs > 0 && now - createdMs < NEW_ACCOUNT_GRACE_MS;
}

/** True when the student has been active recently enough that a nudge would be redundant. */
export function isRecentlyActive(lastActiveMs: number, now: number): boolean {
  if (lastActiveMs <= 0) return false;
  return now - lastActiveMs < INACTIVITY_THRESHOLD_MS;
}
