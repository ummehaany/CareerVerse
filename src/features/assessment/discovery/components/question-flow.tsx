"use client";

import { useEffect, useRef, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ArrowRightIcon, CheckIcon } from "@/components/ui/icon";
import { useDiscoveryFlow } from "../hooks/use-discovery-flow";
import { DiscoveryQuestionView } from "./discovery-question-view";
import type { AnswerValue, DiscoveryAnswers, DiscoveryOption, DiscoveryQuestion } from "../types";

/**
 * Drives a one-question-at-a-time flow over any question list: progress bar,
 * Back/Continue, and auto-advance for single-choice questions so the
 * mandatory 20-question Core tier moves fast without feeling like a form.
 * Shared by the Core and Deep (optional) assessments.
 */
export function QuestionFlow({
  questions,
  initialAnswers,
  resolveDynamic,
  onComplete,
  onExit,
  finishLabel = "See my results",
}: {
  questions: DiscoveryQuestion[];
  initialAnswers?: DiscoveryAnswers;
  /** For questions with `dynamicSource` — resolves title/options from the student's answers so far. */
  resolveDynamic?: (question: DiscoveryQuestion, answers: DiscoveryAnswers) => { title?: string; helpText?: string; options: DiscoveryOption[] };
  onComplete: (answers: DiscoveryAnswers) => void;
  onExit?: () => void;
  finishLabel?: string;
}) {
  const flow = useDiscoveryFlow(questions, initialAnswers);
  const [advancing, setAdvancing] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleChange(value: AnswerValue) {
    flow.setAnswer(flow.question.id, value);
    if (flow.question.type === "single") {
      setAdvancing(true);
      timerRef.current = setTimeout(() => {
        setAdvancing(false);
        if (flow.isLast) {
          onComplete({ ...flow.answers, [flow.question.id]: value });
        } else {
          flow.goNext();
          scrollTop();
        }
      }, 320);
    }
  }

  function handleContinue() {
    if (flow.isLast) {
      onComplete(flow.answers);
      return;
    }
    flow.goNext();
    scrollTop();
  }

  function handleBack() {
    if (flow.isFirst) {
      onExit?.();
      return;
    }
    flow.goBack();
    scrollTop();
  }

  // Single-choice questions always auto-advance (including the last one);
  // only "multi" questions (e.g. the companies question) need an explicit
  // Continue, since there's nothing to auto-trigger on.
  const showContinueButton = flow.question.type === "multi";

  const dynamic = flow.question.dynamicSource ? resolveDynamic?.(flow.question, flow.answers) : undefined;
  const effectiveQuestion = dynamic
    ? { ...flow.question, title: dynamic.title ?? flow.question.title, helpText: dynamic.helpText ?? flow.question.helpText }
    : flow.question;

  return (
    <div ref={topRef} className="mx-auto max-w-2xl scroll-mt-20 space-y-6">
      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="font-medium text-muted">
            Question {flow.index + 1} of {flow.total}
          </span>
          <span className="tabular-nums text-subtle">{flow.progressPercent}%</span>
        </div>
        <Progress value={flow.progressPercent} label="Career Discovery progress" />
      </div>

      <div key={flow.question.id} className="cv-q-enter">
        <DiscoveryQuestionView
          question={effectiveQuestion}
          value={flow.answers[flow.question.id]}
          onChange={handleChange}
          dynamicOptions={dynamic?.options}
        />
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-border pt-5">
        <Button variant="ghost" onClick={handleBack} disabled={advancing}>
          <ChevronLeftIcon size={18} />
          Back
        </Button>

        {showContinueButton && (
          <Button onClick={handleContinue} disabled={!flow.currentAnswered || advancing}>
            {flow.isLast ? finishLabel : "Continue"}
            {flow.isLast ? <CheckIcon size={18} /> : <ArrowRightIcon size={18} />}
          </Button>
        )}
      </div>
    </div>
  );
}
