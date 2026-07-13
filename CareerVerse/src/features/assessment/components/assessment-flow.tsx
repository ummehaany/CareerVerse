"use client";

import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AssessmentDraftView } from "../types";
import { useAssessment } from "../hooks/use-assessment";
import { useAutosave } from "../hooks/use-autosave";
import { saveAssessmentProgress, completeAssessment } from "../actions";
import { AssessmentIntro } from "./assessment-intro";
import { AssessmentSuccess } from "./assessment-success";
import { ProgressHeader } from "./progress-header";
import { QuestionField } from "./question-field";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { ChevronLeftIcon, ArrowRightIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";

type Phase = "intro" | "active" | "success";

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

  const a = useAssessment(initialDraft?.answers ?? {}, initialDraft?.currentStep ?? 0);
  const draftIdRef = useRef<string | null>(initialDraft?.id ?? null);
  const topRef = useRef<HTMLDivElement>(null);

  const onSave = useCallback(async () => {
    const result = await saveAssessmentProgress({
      id: draftIdRef.current,
      currentStep: a.stepIndex,
      answers: a.answers,
    });
    if (result.ok) draftIdRef.current = result.id;
    else throw new Error(result.error);
  }, [a.stepIndex, a.answers]);

  const saveStatus = useAutosave(
    JSON.stringify({ step: a.stepIndex, answers: a.answers }),
    onSave,
    { enabled: phase === "active" },
  );

  function scrollToTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleStart(resume: boolean) {
    if (!resume) {
      a.reset({}, 0);
      draftIdRef.current = null;
    }
    setSubmitError(null);
    setPhase("active");
  }

  function handleNext() {
    if (a.goNext()) scrollToTop();
  }

  function handleBack() {
    a.goBack();
    scrollToTop();
  }

  async function handleSubmit() {
    if (!a.validateStep()) return;
    setSubmitting(true);
    setSubmitError(null);
    const result = await completeAssessment({
      id: draftIdRef.current,
      currentStep: a.stepIndex,
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
    <div ref={topRef} className="mx-auto max-w-3xl scroll-mt-20 space-y-6">
      <ProgressHeader
        stepIndex={a.stepIndex}
        stepCount={a.stepCount}
        section={a.section}
        progressPercent={a.progressPercent}
        answeredTotal={a.answeredTotal}
        saveStatus={saveStatus}
      />

      <div>
        <h2 className="text-lg font-semibold tracking-tight">{a.section.title}</h2>
        <p className="text-sm text-muted">{a.section.subtitle}</p>
      </div>

      <div className="space-y-4">
        {a.questions.map((question) => (
          <QuestionField
            key={question.id}
            question={question}
            value={a.answers[question.id]}
            error={a.errors[question.id]}
            onChange={(value) => a.setAnswer(question.id, value)}
          />
        ))}
      </div>

      {submitError && <Alert variant="error">{submitError}</Alert>}

      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <Button
          variant="ghost"
          onClick={handleBack}
          disabled={a.stepIndex === 0 || submitting}
        >
          <ChevronLeftIcon size={18} />
          Back
        </Button>

        {a.isLastStep ? (
          <Button onClick={handleSubmit} isLoading={submitting}>
            Finish &amp; save
            <ArrowRightIcon size={18} />
          </Button>
        ) : (
          <Button onClick={handleNext}>
            Continue
            <ArrowRightIcon size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}
