/** Centralized route paths. Import these instead of hardcoding strings. */
export const ROUTES = {
  home: "/",
  login: "/login",
  signup: "/signup",
  forgotPassword: "/forgot-password",
  verifyEmail: "/verify-email",

  // Authenticated app
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
  mentor: "/mentor",
  profile: "/profile",
  settings: "/settings",
} as const;

export type RouteKey = keyof typeof ROUTES;
