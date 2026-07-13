/**
 * Shared utility helpers.
 * Add small, reusable, framework-agnostic functions here.
 */

/**
 * Join class name values, ignoring falsy entries.
 * A lightweight, dependency-free alternative for conditional classes.
 */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}
