import type { Career } from "@/lib/careers/types";
import { simulateCareer } from "../analysis";
import { getIndiaSalaryLpa } from "@/lib/careers/salary-india";

/** Growth ratios aligned to the four projection steps in `simulateCareer`. */
const STEP_RATIOS = [0.05, 0.4, 0.75, 1.0];

export function CareerSimulator({ career }: { career: Career }) {
  const projection = simulateCareer(career);
  const { minLpa, maxLpa } = getIndiaSalaryLpa(career.slug, career.salary);

  const lpaAt = (ratio: number) => {
    const value = minLpa + (maxLpa - minLpa) * ratio;
    return Number.isInteger(value) ? `${value}` : value.toFixed(1);
  };

  return (
    <div className="space-y-4">
      <p className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted">
        This is an educational projection based on typical trajectories — not a prediction or a
        guarantee. Real paths vary widely. Figures are indicative Indian pay in ₹ LPA.
      </p>

      <ol className="relative space-y-4 border-l border-border pl-6">
        {projection.map((step, index) => (
          <li key={step.year} className="relative">
            <span className="absolute -left-[27px] grid h-5 w-5 place-items-center rounded-full border-2 border-primary bg-background text-[10px] font-bold text-primary">
              {step.year}
            </span>
            <div className="rounded-xl border border-border bg-background p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">
                  Year {step.year} · {step.stage}
                </p>
                <p className="text-sm font-semibold text-primary tabular-nums">
                  ~₹{lpaAt(STEP_RATIOS[index] ?? 1)} LPA
                </p>
              </div>
              <p className="mt-1 text-sm text-muted">{step.focus}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
