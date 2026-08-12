import { ROUTES } from "@/config/routes";

/*
 * First-milestones checklist shown on the dashboard after onboarding (Step 8).
 * Completion is derived from live user data on every dashboard render, so the
 * list updates automatically as the user actually uses the product.
 */

export interface ChecklistSignals {
  assessmentDone: boolean;
  resumeExists: boolean;
  companiesExplored: boolean;
  interviewsStarted: boolean;
  roadmapViewed: boolean;
}

export interface ChecklistItem {
  key: keyof ChecklistSignals;
  label: string;
  href: string;
  done: boolean;
}

/** Build the ordered checklist items from raw completion signals. */
export function buildChecklist(signals: ChecklistSignals): ChecklistItem[] {
  return [
    { key: "assessmentDone", label: "Complete Career Assessment", href: ROUTES.assessment, done: signals.assessmentDone },
    { key: "resumeExists", label: "Upload Resume", href: ROUTES.resume, done: signals.resumeExists },
    { key: "companiesExplored", label: "Explore Target Companies", href: ROUTES.companies, done: signals.companiesExplored },
    { key: "interviewsStarted", label: "Start Interview Practice", href: ROUTES.interviews, done: signals.interviewsStarted },
    { key: "roadmapViewed", label: "View Career Roadmap", href: ROUTES.roadmap, done: signals.roadmapViewed },
  ];
}
