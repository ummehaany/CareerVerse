import type { CareerSalary, DemandLevel } from "@/lib/careers/types";

export function formatSalaryRange(salary: CareerSalary): string {
  const k = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
  return `${k(salary.min)} – ${k(salary.max)}`;
}

export type DemandBadgeVariant = "success" | "primary" | "warning" | "muted";

export function demandVariant(demand: DemandLevel): DemandBadgeVariant {
  switch (demand) {
    case "Very High":
      return "success";
    case "High":
      return "primary";
    case "Growing":
      return "warning";
    default:
      return "muted";
  }
}
