"use client";

import { useEffect, useState } from "react";
import type { InterviewQuestion, InterviewType } from "@/types/interview";
import { interviewTypeMeta } from "../config";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ClockIcon, ChevronLeftIcon, ChevronRightIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function formatTime(seconds: number): string {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export function InterviewSession({
  role,
  type,
  perQuestionSeconds,
  questions,
  initialAnswers,
  initialIndex = 0,
  onChange,
  onSubmit,
  submitting,
}: {
  role: string;
  type: InterviewType;
  perQuestionSeconds: number;
  questions: InterviewQuestion[];
  initialAnswers?: Record<string, string>;
  initialIndex?: number;
  onChange?: (answers: Record<string, string>, index: number) => void;
  onSubmit: (answers: Array<{ questionId: string; answer: string }>) => void;
  submitting: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers ?? {});
  const [index, setIndex] = useState(Math.min(initialIndex, questions.length - 1));
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(perQuestionSeconds);

  const current = questions[index];
  const meta = interviewTypeMeta(type);
  const answeredCount = questions.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;
  const percent = Math.round((answeredCount / questions.length) * 100);

  // Reset the timer whenever the question changes.
  useEffect(() => {
    setTimeLeft(perQuestionSeconds);
  }, [index, perQuestionSeconds]);

  // Tick down once per second.
  useEffect(() => {
    if (timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft((v) => v - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft]);

  // Auto-advance when time runs out (stays put on the last question).
  useEffect(() => {
    if (timeLeft > 0) return;
    setIndex((i) => (i < questions.length - 1 ? i + 1 : i));
  }, [timeLeft, questions.length]);

  // Persist to the resumable draft.
  useEffect(() => {
    onChange?.(answers, index);
  }, [answers, index, onChange]);

  function setAnswer(value: string) {
    if (!current) return;
    setAnswers((prev) => ({ ...prev, [current.id]: value }));
  }

  function go(to: number) {
    setIndex(Math.max(0, Math.min(questions.length - 1, to)));
  }

  function skip() {
    if (current) setSkipped((prev) => new Set(prev).add(current.id));
    go(index + 1);
  }

  function handleSubmit() {
    onSubmit(questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "" })));
  }

  function statusOf(q: InterviewQuestion, i: number): "current" | "answered" | "skipped" | "todo" {
    if (i === index) return "current";
    if ((answers[q.id] ?? "").trim()) return "answered";
    if (skipped.has(q.id)) return "skipped";
    return "todo";
  }

  const lowTime = timeLeft <= 10;
  const isLast = index === questions.length - 1;

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="rounded-2xl border border-border bg-background p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-subtle">{meta.label}</p>
            <h2 className="mt-0.5 truncate text-lg font-semibold tracking-tight">{role}</h2>
          </div>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-sm font-semibold tabular-nums",
              lowTime ? "border-danger/40 bg-danger/10 text-danger" : "border-border text-muted",
            )}
            aria-live="off"
          >
            <ClockIcon size={15} />
            {formatTime(timeLeft)}
          </span>
        </div>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">
              Question {index + 1} of {questions.length}
            </span>
            <span className="tabular-nums text-muted">{answeredCount} answered</span>
          </div>
          <Progress value={percent} label="Progress" />
        </div>
        {/* Navigator */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {questions.map((q, i) => {
            const st = statusOf(q, i);
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Go to question ${i + 1}`}
                aria-current={st === "current" ? "step" : undefined}
                className={cn(
                  "grid h-7 w-7 place-items-center rounded-md text-xs font-semibold tabular-nums transition-colors",
                  st === "current" && "bg-primary text-primary-foreground",
                  st === "answered" && "bg-success/15 text-success",
                  st === "skipped" && "bg-warning/15 text-warning",
                  st === "todo" && "bg-foreground/5 text-subtle hover:bg-foreground/10",
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current question */}
      {current && (
        <div key={current.id} className="rounded-2xl border border-border bg-background p-5 animate-fade-up">
          <div className="mb-2 flex items-center gap-2">
            <span className="text-sm font-semibold text-subtle tabular-nums">{String(index + 1).padStart(2, "0")}</span>
            <Badge variant="muted">{current.focusArea}</Badge>
          </div>
          <p className="text-base font-medium">{current.question}</p>
          <Textarea
            className="mt-3"
            value={answers[current.id] ?? ""}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer… Aim for a structured response with a concrete example."
            rows={6}
            aria-label={`Answer to question ${index + 1}`}
          />
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => go(index - 1)} disabled={index === 0}>
            <ChevronLeftIcon size={15} />
            Previous
          </Button>
          {!isLast ? (
            <>
              <Button variant="ghost" size="sm" onClick={skip}>
                Skip
              </Button>
              <Button variant="outline" size="sm" onClick={() => go(index + 1)}>
                Next
                <ChevronRightIcon size={15} />
              </Button>
            </>
          ) : (
            <Button variant="ghost" size="sm" onClick={skip} disabled>
              Last question
            </Button>
          )}
        </div>
        <Button onClick={handleSubmit} isLoading={submitting}>
          Submit for scoring
        </Button>
      </div>
      <p className="text-center text-xs text-subtle">
        You can revisit any question using the numbers above. Unanswered questions score lower.
      </p>
    </div>
  );
}
