/**
 * Profile editing constants. These are plain (non-server) values, kept out of
 * the "use server" actions file so they can be imported by client components
 * (Next.js only allows async function exports from a "use server" module).
 */
export const DISPLAY_NAME_MIN = 2;
export const DISPLAY_NAME_MAX = 50;
