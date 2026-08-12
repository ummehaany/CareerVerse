"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileTextIcon, CheckIcon, CheckCircleIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import type { ResumeMatchResult } from "../types";

export function ResumeMatchSection({
  match,
  companyName,
}: {
  match: ResumeMatchResult;
  companyName: string;
}) {
  if (!match.hasResume) {
    return (
      <Card className="flex flex-col items-center gap-4 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <FileTextIcon size={26} />
        </span>
        <div className="space-y-1">
          <p className="font-medium">Build a resume to unlock the match</p>
          <p className="mx-auto max-w-md text-sm text-muted">
            Create your resume in the Resume Builder and we&apos;ll score it against {companyName}&apos;s
            expectations, surface missing keywords, and suggest ATS improvements.
          </p>
        </div>
        <Link
          href={ROUTES.resume}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          Open Resume Builder
        </Link>
      </Card>
    );
  }

  const color =
    match.score >= 80 ? "var(--success)" : match.score >= 60 ? "var(--primary)" : match.score >= 40 ? "var(--warning)" : "var(--danger)";

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FileTextIcon size={18} className="text-primary" />
            <h2 className="text-base font-semibold tracking-tight">Resume match — {companyName}</h2>
          </div>
          <span className="text-2xl font-bold tabular-nums" style={{ color }}>
            {match.score}%
          </span>
        </div>
        <Progress value={match.score} color={color} />
        <p className="text-xs text-subtle">
          Based on keyword coverage for this role blended with your overall resume completeness.
        </p>
      </Card>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">Matched keywords ({match.matchedKeywords.length})</h3>
          {match.matchedKeywords.length ? (
            <div className="flex flex-wrap gap-1.5">
              {match.matchedKeywords.map((k) => (
                <span key={k} className="inline-flex items-center gap-1 rounded-full border border-success/25 bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                  <CheckIcon size={12} /> {k}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-subtle">No strong matches yet — add relevant keywords.</p>
          )}
        </Card>

        <Card className="space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">Missing keywords ({match.missingKeywords.length})</h3>
          {match.missingKeywords.length ? (
            <div className="flex flex-wrap gap-1.5">
              {match.missingKeywords.map((k) => (
                <span key={k} className="inline-flex rounded-full border border-border bg-foreground/[0.03] px-2.5 py-0.5 text-xs font-medium text-foreground/75">
                  {k}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-subtle">Excellent — you cover the key terms.</p>
          )}
        </Card>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">ATS suggestions</h3>
          <ul className="space-y-1.5">
            {match.atsSuggestions.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-muted">
                <CheckCircleIcon size={15} className="mt-0.5 shrink-0 text-primary" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-3">
          <h3 className="text-sm font-semibold tracking-tight">Formatting improvements</h3>
          <ul className="space-y-1.5">
            {match.formatting.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-muted">
                <CheckCircleIcon size={15} className="mt-0.5 shrink-0 text-primary" />
                {s}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {(match.missingProjects || match.missingAchievements) && (
        <Card className="space-y-2 bg-surface">
          <h3 className="text-sm font-semibold tracking-tight">Content gaps</h3>
          <ul className="space-y-1.5">
            {match.missingProjects && (
              <li className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                Add 1–2 relevant <strong className="font-medium text-foreground">projects</strong> that mirror this role.
              </li>
            )}
            {match.missingAchievements && (
              <li className="flex items-start gap-2 text-sm text-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                Add measurable <strong className="font-medium text-foreground">achievements</strong> (impact, metrics, awards).
              </li>
            )}
          </ul>
          <Link href={ROUTES.resume} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Improve in Resume Builder →
          </Link>
        </Card>
      )}
    </div>
  );
}
