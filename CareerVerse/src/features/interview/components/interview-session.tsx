"use client";

import { useState } from "react";
import type { InterviewQuestion } from "@/types/interview";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export function InterviewSession({
  role,
  questions,
  onSubmit,
  submitting,
}: {
  role: string;
  questions: InterviewQuestion[];
  onSubmit: (answers: Array<{ questionId: string; answer: string }>) => void;
  submitting: boolean;
}) {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const answeredCount = questions.filter((q) => (answers[q.id] ?? "").trim().length > 0).length;
  const percent = Math.round((answeredCount / questions.length) * 100);

  function handleSubmit() {
    onSubmit(questions.map((q) => ({ questionId: q.id, answer: answers[q.id] ?? "" })));
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-background p-5">
        <p className="text-xs font-medium uppercase tracking-wide text-subtle">Mock interview</p>
        <h2 className="mt-0.5 text-lg font-semibold tracking-tight">{role}</h2>
        <div className="mt-3 space-y-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted">Answered</span>
            <span className="tabular-nums text-muted">
              {answeredCount}/{questions.length}
            </span>
          </div>
          <Progress value={percent} label="Answered questions" />
        </div>
      </div>

      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-2xl border border-border bg-background p-5">
            <div className="mb-2 flex items-center gap-2">
              <span className="text-sm font-semibold text-subtle tabular-nums">
                {String(index + 1).padStart(2, "0")}
              </span>
              <Badge variant="muted">{question.focusArea}</Badge>
            </div>
            <p className="font-medium">{question.question}</p>
            <Textarea
              className="mt-3"
              value={answers[question.id] ?? ""}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))}
              placeholder="Type your answer…"
              rows={4}
              aria-label={`Answer to question ${index + 1}`}
            />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <p className="text-sm text-muted">
          {answeredCount < questions.length
            ? "You can submit anytime — unanswered questions score lower."
            : "All questions answered."}
        </p>
        <Button onClick={handleSubmit} isLoading={submitting}>
          Submit for scoring
        </Button>
      </div>
    </div>
  );
}
