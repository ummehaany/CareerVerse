"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnswerValue, AssessmentDraftView, Question } from "../types";
import { useAssessment } from "../hooks/use-assessment";
import { useAutosave } from "../hooks/use-autosave";
import { saveAssessmentProgress, completeAssessment } from "../actions";
import { AssessmentIntro } from "./assessment-intro";
import { AssessmentSuccess } from "./assessment-success";
import { ProgressHeader } from "./progress-header";
import { QuestionField } from "./question-field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ChevronLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

type Phase = "intro" | "active" | "success";

/** Human-readable summary of an answer for the review panel. */
function summarize(question: Question, value: AnswerValue | undefined): string {
  if (value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
    return "—";
  }
  if (question.type === "scale") return String(value);
  if (question.type === "text" || question.type === "longtext") {
    const text = String(value).trim();
    return text.length > 90 ? `${text.slice(0, 90)}…` : text || "—";
  }
  const labelOf = (v: string) =>
    question.options?.find((o) => o.value === v)?.label ?? v;
  if (Array.isArray(value)) return value.map(labelOf).join(", ");
  return labelOf(String(value));
}

export function AssessmentFlow({
  initialDraft,
  hasCompleted,
}: {
  initialDraft: AssessmentDraftView | null;
  hasCompleted: boolean;
}) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [pendingAdvance, setPendingAdvance] = useState(0);

  const a = useAssessment(initialDraft?.answers ?? {}, initialDraft?.currentStep ?? 0);
  const draftIdRef = useRef<string | null>(initialDraft?.id ?? null);
  const topRef = useRef<HTMLDivElement>(null);

  const onSave = useCallback(async () => {
    const result = await saveAssessmentProgress({
      id: draftIdRef.current,
      currentStep: a.index,
      answers: a.answers,
    });
    if (result.ok) draftIdRef.current = result.id;
    else throw new Error(result.error);
  }, [a.index, a.answers]);

  const saveStatus = useAutosave(
    JSON.stringify({ step: a.index, answers: a.answers }),
    onSave,
    { enabled: phase === "active" },
  );

  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handleNext = useCallback(() => {
    if (a.goNext()) scrollToTop();
  }, [a, scrollToTop]);

  // Auto-advance after a single-choice / scale selection settles into state.
  useEffect(() => {
    if (pendingAdvance === 0) return;
    if (!a.isLast && a.goNext()) scrollToTop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingAdvance]);

  const handleChange = useCallback(
    (question: Question, value: AnswerValue) => {
      a.setAnswer(question.id, value);
      if (question.type === "single" || question.type === "scale") {
        setPendingAdvance((n) => n + 1);
      }
    },
    [a],
  );

  // Keyboard: number keys pick a single-choice option; Enter advances.
  useEffect(() => {
    if (phase !== "active" || reviewing || submitting) return;
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const inTextarea = target?.tagName === "TEXTAREA";
      const q = a.question;
      if (e.key === "Enter" && !inTextarea && !e.shiftKey) {
        e.preventDefault();
        if (!a.isLast) handleNext();
        return;
      }
      if (q.type === "single" && /^[1-9]$/.test(e.key) && !target?.matches("input, textarea")) {
        const option = q.options?.[Number(e.key) - 1];
        if (option) {
          e.preventDefault();
          handleChange(q, option.value);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, reviewing, submitting, a, handleNext, handleChange]);

  function handleStart(resume: boolean) {
    if (!resume) {
      a.reset({}, 0);
      draftIdRef.current = null;
    }
    setSubmitError(null);
    setReviewing(false);
    setPhase("active");
  }

  function handleBack() {
    a.goBack();
    scrollToTop();
  }

  function editFromReview(target: number) {
    a.goTo(target);
    setReviewing(false);
    scrollToTop();
  }

  async function handleSubmit() {
    if (!a.validateCurrent()) {
      setReviewing(false);
      scrollToTop();
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    const result = await completeAssessment({
      id: draftIdRef.current,
      currentStep: a.index,
      answers: a.answers,
    });
    setSubmitting(false);

    if (result.ok) {
      setPhase("success");
      router.refresh();
      return;
    }

    setSubmitError(result.error);
    if (result.fieldErrors) {
      a.showErrors(result.fieldErrors);
      setReviewing(false);
      scrollToTop();
    }
  }

  if (phase === "intro") {
    return (
      <AssessmentIntro draft={initialDraft} hasCompleted={hasCompleted} onStart={handleStart} />
    );
  }

  if (phase === "success") {
    return <AssessmentSuccess onGoDashboard={() => router.push(ROUTES.dashboard)} />;
  }

  return (
    <div ref={topRef} className="mx-auto max-w-2xl scroll-mt-20 space-y-6">
      <ProgressHeader
        index={a.index}
        total={a.total}
        section={a.section}
        progressPercent={a.progressPercent}
        answeredTotal={a.answeredTotal}
        saveStatus={saveStatus}
      />

      {reviewing ? (
        <ReviewPanel
          visited={a.visited}
          answers={a.answers}
          onEdit={editFromReview}
          onClose={() => setReviewing(false)}
        />
      ) : (
        <>
          <div key={a.question.id} className="cv-q-enter">
            <QuestionField
              question={a.question}
              value={a.answers[a.question.id]}
              error={a.currentError}
              onChange={(value) => handleChange(a.question, value)}
            />
          </div>

          {a.question.type === "single" && (
            <p className="px-1 text-xs text-subtle">
              Tip: press 1–{Math.min(9, a.question.options?.length ?? 0)} to choose, Enter to
              continue.
            </p>
          )}

          {submitError && <Alert variant="error">{submitError}</Alert>}

          <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
            <Button variant="ghost" onClick={handleBack} disabled={a.isFirst || submitting}>
              <ChevronLeftIcon size={18} />
              Back
            </Button>

            <div className="flex items-center gap-2">
              {a.maxReached > 0 && (
                <Button variant="ghost" onClick={() => setReviewing(true)} disabled={submitting}>
                  Review
                </Button>
              )}
              {a.isLast ? (
                <Button onClick={handleSubmit} isLoading={submitting}>
                  Finish &amp; save
                  <ArrowRightIcon size={18} />
                </Button>
              ) : (
                <Button onClick={handleNext} disabled={submitting}>
                  Continue
                  <ArrowRightIcon size={18} />
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function ReviewPanel({
  visited,
  answers,
  onEdit,
  onClose,
}: {
  visited: { question: Question; index: number }[];
  answers: Record<string, AnswerValue>;
  onEdit: (index: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Review your answers</h2>
          <p className="text-sm text-muted">Tap any answer to jump back and edit it.</p>
        </div>
        <Button variant="ghost" onClick={onClose}>
          Close
        </Button>
      </div>

      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-background">
        {visited.map(({ question, index }) => {
          const answered =
            answers[question.id] !== undefined &&
            !(Array.isArray(answers[question.id]) &&
              (answers[question.id] as unknown[]).length === 0);
          return (
            <li key={question.id}>
              <button
                type="button"
                onClick={() => onEdit(index)}
                className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface"
              >
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{question.title}</span>
                  <span
                    className={cn(
                      "mt-0.5 block text-sm",
                      answered ? "text-muted" : "text-subtle italic",
                    )}
                  >
                    {summarize(question, answers[question.id])}
                  </span>
                </span>
                {answered && <CheckIcon size={16} className="mt-0.5 shrink-0 text-success" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
