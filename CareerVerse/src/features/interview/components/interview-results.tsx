"use client";

import type { InterviewEvaluation, InterviewQuestion } from "@/types/interview";
import { ScoreRing } from "./score-ring";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SparklesIcon, TargetIcon, CheckIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function scoreColor(score: number): string {
  return score >= 7.5 ? "var(--success)" : score >= 5 ? "var(--primary)" : score >= 3 ? "var(--warning)" : "var(--danger)";
}

export function InterviewResults({
  role,
  questions,
  evaluation,
  onNew,
}: {
  role: string;
  questions: InterviewQuestion[];
  evaluation: InterviewEvaluation;
  onNew: () => void;
}) {
  const byId = new Map(questions.map((q) => [q.id, q]));

  return (
    <div className="space-y-6 animate-fade-up">
      <section className="overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-5 sm:p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <ScoreRing value={evaluation.overallScore} />
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-subtle">Results · {role}</p>
            <h1 className="mt-0.5 text-xl font-semibold tracking-tight">Interview scored</h1>
            <p className="mt-1 max-w-xl text-sm text-muted">{evaluation.summary}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <SparklesIcon size={16} className="text-success" />
            Strengths
          </p>
          <ul className="mt-3 space-y-1.5">
            {evaluation.strengths.length === 0 && <li className="text-sm text-subtle">—</li>}
            {evaluation.strengths.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-muted">
                <CheckIcon size={15} className="mt-0.5 shrink-0 text-success" />
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-2xl border border-border bg-background p-5">
          <p className="flex items-center gap-1.5 text-sm font-semibold">
            <TargetIcon size={16} className="text-primary" />
            Areas to improve
          </p>
          <ul className="mt-3 space-y-1.5">
            {evaluation.improvements.length === 0 && <li className="text-sm text-subtle">—</li>}
            {evaluation.improvements.map((s) => (
              <li key={s} className="flex items-start gap-2 text-sm text-muted">
                <TargetIcon size={15} className="mt-0.5 shrink-0 text-primary" />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Per-question feedback</h2>
        <div className="space-y-3">
          {evaluation.items.map((item, index) => {
            const question = byId.get(item.questionId);
            return (
              <div key={item.questionId} className="rounded-2xl border border-border bg-background p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1.5 flex items-center gap-2">
                      <span className="text-sm font-semibold text-subtle tabular-nums">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {question && <Badge variant="muted">{question.focusArea}</Badge>}
                    </div>
                    <p className="font-medium">{question?.question}</p>
                  </div>
                  <span
                    className="shrink-0 rounded-lg px-2.5 py-1 text-sm font-bold tabular-nums text-white"
                    style={{ backgroundColor: scoreColor(item.score) }}
                  >
                    {item.score}/10
                  </span>
                </div>
                <div className="mt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
                    <div
                      className={cn("h-full rounded-full")}
                      style={{ width: `${item.score * 10}%`, backgroundColor: scoreColor(item.score) }}
                    />
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted">{item.feedback}</p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex justify-center">
        <Button onClick={onNew}>Start a new interview</Button>
      </div>
    </div>
  );
}
