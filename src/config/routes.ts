/** Centralized route paths. Import these instead of hardcoding strings. */
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  verifyEmail: "/verify-email",

  // Authenticated app
  onboarding: "/onboarding",
  dashboard: "/dashboard",
  assessment: "/assessment",
  recommendations: "/recommendations",
  careers: "/careers",
  compare: "/compare",
  roadmap: "/roadmap",
  timeline: "/timeline",
  learning: "/learning",
  resume: "/resume",
  interviews: "/interviews",
  achievements: "/achievements",
  coach: "/coach",
  profile: "/profile",
  portfolio: "/portfolio",
  settings: "/settings",
  about: "/about",
  skillGap: "/skill-gap",
  companies: "/companies",
  analytics: "/analytics",
  pricing: "/pricing",
} as const;

export type RouteKey = keyof typeof ROUTES;
