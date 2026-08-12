/*
 * Public profile identity helpers.
 *
 * The public CareerVerse profile lives at a future-ready URL
 * (careerverse.app/u/<username>). Username derivation and URL construction are
 * centralized here so the profile page, share actions, and a future public
 * route/back-end all resolve identities the same way.
 */

/** Host + path prefix for public profiles (future public route). */
export const PUBLIC_PROFILE_BASE = "careerverse.app/u";

export interface IdentityInput {
  displayName?: string | null;
  email?: string | null;
  uid?: string | null;
}

/** A stable, URL-safe handle derived from the display name, then email, then uid. */
export function deriveUsername(input: IdentityInput): string {
  const fromName = (input.displayName ?? "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "");
  if (fromName.length >= 3) return fromName.slice(0, 24);

  const fromEmail = (input.email ?? "")
    .split("@")[0]
    ?.toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "");
  if (fromEmail && fromEmail.length >= 3) return fromEmail.slice(0, 24);

  return (input.uid ?? "user").slice(0, 12).toLowerCase();
}

/** Display form without protocol, e.g. "careerverse.app/u/ummehaanyk". */
export function publicProfilePath(username: string): string {
  return `${PUBLIC_PROFILE_BASE}/${username}`;
}

/** Full URL for copy/share, e.g. "https://careerverse.app/u/ummehaanyk". */
export function publicProfileUrl(username: string): string {
  return `https://${publicProfilePath(username)}`;
}
