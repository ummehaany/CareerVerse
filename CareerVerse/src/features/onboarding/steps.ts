/*
 * Product-tour configuration. Each step points at a sidebar nav element via its
 * `data-tour` key (added to NavItem); the tour spotlights that element and shows
 * a concise explanation. Kept as data so the tour component stays generic.
 */

export interface TourStep {
  /** Matches the `data-tour="<key>"` attribute on the target element. */
  target: string;
  title: string;
  body: string;
}

export const TOUR_STEPS: TourStep[] = [
  { target: "dashboard", title: "Dashboard", body: "Your home base — a live snapshot of your career readiness, today's priority, and recent progress." },
  { target: "assessment", title: "Career Discovery", body: "Start here. A short, conversational discovery builds the profile that powers every match, roadmap, and plan." },
  { target: "recommendations", title: "Career Matches", body: "See the careers that fit you best, ranked from your assessment with a clear fit score." },
  { target: "coach", title: "Career Planning", body: "Enter any goal and instantly get a complete, personalized career plan — skills, roadmap, and more." },
  { target: "roadmap", title: "Learning Roadmap", body: "Follow a month-by-month learning path toward your target role and track each milestone." },
  { target: "resume", title: "Resume Builder", body: "Build an ATS-ready resume with AI assistance and export it as a polished PDF." },
  { target: "companies", title: "Target Companies", body: "Explore top companies and measure your readiness against exactly what it takes to get in." },
  { target: "interviews", title: "Mock Interviews", body: "Practice realistic mock interviews and get AI feedback, scores, and analytics." },
  { target: "analytics", title: "Analytics", body: "Track your growth over time — readiness trends, XP, streaks, and achievements." },
  { target: "settings", title: "Profile & Settings", body: "Manage your profile, appearance, privacy, and account — and replay this tour anytime." },
];

/** Window event that lets the Settings button replay the tour on demand. */
export const START_TOUR_EVENT = "cv:start-tour";
