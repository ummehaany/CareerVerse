import type { Career, CareerSalary, DemandLevel } from "@/lib/careers/types";
import { getIndiaSalaryLpa } from "@/lib/careers/salary-india";

export type Currency = "INR" | "USD";

/** US annual band, e.g. "$85k – $170k". */
export function formatSalaryRange(salary: CareerSalary): string {
  const k = (n: number) => (n >= 1000 ? `$${Math.round(n / 1000)}k` : `$${n}`);
  return `${k(salary.min)} – ${k(salary.max)}`;
}

function lpa(n: number): string {
  return Number.isInteger(n) ? `${n}` : n.toFixed(1);
}

/** Indian pay band in ₹ LPA, e.g. "₹6 LPA – ₹18 LPA". */
export function formatSalaryLpa(slug: string, salary: CareerSalary): string {
  const { minLpa, maxLpa } = getIndiaSalaryLpa(slug, salary);
  return `₹${lpa(minLpa)} LPA – ₹${lpa(maxLpa)} LPA`;
}

/** Salary for a career in the requested currency (INR ₹ LPA by default). */
export function formatCareerSalary(career: Career, currency: Currency): string {
  return currency === "USD"
    ? formatSalaryRange(career.salary)
    : formatSalaryLpa(career.slug, career.salary);
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
