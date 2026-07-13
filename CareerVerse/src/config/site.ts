/**
 * Global, app-wide static configuration.
 * Keep environment-specific values in `.env.local` (see `.env.example`).
 */
export const siteConfig = {
  name: "CareerVerse",
  description: "CareerVerse web application.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export type SiteConfig = typeof siteConfig;
