import type { SkillRecommendation } from "../types";
import { ClockIcon, RocketIcon, CheckIcon } from "@/components/ui/icon";
import { ExternalLinkIcon, AwardIcon } from "@/components/ui/icons-extended";
import { cn } from "@/lib/utils";

const PRIORITY_CLASS: Record<SkillRecommendation["priority"], string> = {
  Critical: "border-danger/30 bg-danger/10 text-danger",
  High: "border-warning/30 bg-warning/10 text-warning",
  Medium: "border-border bg-foreground/[0.04] text-muted",
};

export function RecommendationCard({ rec }: { rec: SkillRecommendation }) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold tracking-tight">{rec.skill}</h3>
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full border px-2 py-0.5 text-xs font-medium", PRIORITY_CLASS[rec.priority])}>
            {rec.priority}
          </span>
          <span className="inline-flex items-center gap-1 text-xs text-subtle">
            <ClockIcon size={13} />~{rec.estWeeks} wks
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <AwardIcon size={13} className="text-primary" />
            Suggested certifications
          </p>
          {rec.certifications.length > 0 ? (
            <ul className="mt-1 space-y-0.5">
              {rec.certifications.map((c) => (
                <li key={c} className="flex items-start gap-1.5 text-sm text-muted">
                  <CheckIcon size={13} className="mt-0.5 shrink-0 text-success" />
                  {c}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-1 text-sm text-subtle">Certifications optional for this skill.</p>
          )}
        </div>
        <div>
          <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
            <RocketIcon size={13} className="text-primary" />
            Practice projects
          </p>
          <ul className="mt-1 space-y-0.5">
            {rec.projects.map((p) => (
              <li key={p} className="text-sm text-muted">
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {rec.resource && (
        <a
          href={rec.resource.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Start learning: {rec.resource.title}
          <ExternalLinkIcon size={13} />
        </a>
      )}
    </div>
  );
}
