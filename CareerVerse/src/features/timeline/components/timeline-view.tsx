import Link from "next/link";
import type { TimelinePageData } from "../types";
import { SectionHeading, EmptyState } from "@/components/shared/state-panels";
import { Progress } from "@/components/ui/progress";
import { CheckIcon, RouteIcon, ClockIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

export function TimelineView({ data }: { data: TimelinePageData }) {
  if (!data.careerTitle || data.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
        <SectionHeading
          title="Career Timeline"
          description="A visual path from today to job-ready."
        />
        <EmptyState
          icon={<RouteIcon size={28} />}
          title="Build a roadmap to see your timeline"
          body="Your timeline is generated from your active learning roadmap, with estimated dates and milestones."
          action={
            <Link
              href={ROUTES.roadmap}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
            >
              Build a roadmap
            </Link>
          }
        />
      </div>
    );
  }

  const milestones = data.items.filter((i) => i.type === "milestone").length;
  const percent = milestones > 0 ? Math.round((data.completed / milestones) * 100) : 0;
  const months = Math.max(1, Math.round(data.totalWeeks / 4.3));

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <SectionHeading
        title="Career Timeline"
        description={`Your path to becoming a ${data.careerTitle}.`}
      />

      <section className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="inline-flex items-center gap-1.5 text-sm text-muted">
            <ClockIcon size={15} className="text-subtle" />~{months} months to job-ready
          </p>
          <p className="text-sm tabular-nums text-muted">
            {data.completed}/{milestones} milestones · {percent}%
          </p>
        </div>
        <div className="mt-3">
          <Progress value={percent} label="Timeline progress" />
        </div>
      </section>

      <ol className="relative space-y-3 border-l border-border pl-6">
        {data.items.map((item) => (
          <li key={item.id} className="relative">
            <span
              className={cn(
                "absolute -left-[31px] grid h-6 w-6 place-items-center rounded-full border-2 bg-background text-[10px] font-bold",
                item.done
                  ? "border-success text-success"
                  : item.type === "checkpoint"
                    ? "border-primary text-primary"
                    : "border-foreground/30 text-subtle",
              )}
            >
              {item.done ? <CheckIcon size={12} /> : ""}
            </span>
            <div
              className={cn(
                "rounded-xl border p-4",
                item.done ? "border-success/30 bg-success/[0.04]" : "border-border bg-background",
              )}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-medium">{item.label}</p>
                <p className="text-xs text-subtle">{item.dateLabel}</p>
              </div>
              <p className="mt-0.5 text-sm text-muted">{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
