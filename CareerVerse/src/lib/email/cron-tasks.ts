/**
 * Pure task-selection logic for the scheduled email cron endpoint, kept out
 * of the route.ts file so it's unit-testable without an HTTP request (Next.js
 * route handlers may only export the HTTP-verb functions and a small set of
 * config constants).
 */
export interface CronTaskSelection {
  doWeekly: boolean;
  doStreak: boolean;
  doPendingAssessment: boolean;
  doWeeklyTask: boolean;
}

/**
 * `all` (default) runs everything. `both` is a legacy alias for `weekly` +
 * `streak`, kept for any scheduler already configured with the old default.
 * Any other named value runs just that one task.
 */
export function resolveCronTasks(task: string): CronTaskSelection {
  return {
    doWeekly: task === "all" || task === "both" || task === "weekly",
    doStreak: task === "all" || task === "both" || task === "streak",
    doPendingAssessment: task === "all" || task === "pendingAssessment",
    doWeeklyTask: task === "all" || task === "weeklyTask",
  };
}
