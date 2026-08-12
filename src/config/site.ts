/**
 * Global, app-wide static configuration.
 * Keep environment-specific values in `.env.local` (see `.env.example`).
 */
export const siteConfig = {
  name: "CareerVerse AI",
  description: "Experience your future before choosing it. AI-powered career discovery, roadmaps, and mentorship.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
} as const;

export type SiteConfig = typeof siteConfig;
