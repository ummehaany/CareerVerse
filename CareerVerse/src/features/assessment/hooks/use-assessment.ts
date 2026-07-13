"use client";

import { useCallback, useMemo, useState } from "react";
import type { Answers, AnswerValue } from "@/types/assessment";
import { SECTIONS, questionsForSection, TOTAL_REQUIRED } from "../questions";
import {
  validateQuestion,
  countAnswered,
  countAnsweredRequired,
  firstIncompleteSectionIndex,
} from "../validation";

function clampStep(step: number): number {
  return Math.min(Math.max(0, step), SECTIONS.length - 1);
}

export function useAssessment(initialAnswers: Answers, initialStep: number) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [stepIndex, setStepIndex] = useState<number>(clampStep(initialStep));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const section = SECTIONS[stepIndex]!;
  const questions = useMemo(() => questionsForSection(section.id), [section.id]);
  const stepCount = SECTIONS.length;
  const isLastStep = stepIndex === stepCount - 1;

  const setAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  const validateStep = useCallback((): boolean => {
    const stepErrors: Record<string, string> = {};
    for (const question of questions) {
      const message = validateQuestion(question, answers[question.id]);
      if (message) stepErrors[question.id] = message;
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  }, [questions, answers]);

  const goNext = useCallback((): boolean => {
    if (!validateStep()) return false;
    setStepIndex((i) => clampStep(i + 1));
    return true;
  }, [validateStep]);

  const goBack = useCallback(() => {
    setErrors({});
    setStepIndex((i) => clampStep(i - 1));
  }, []);

  /** After a server-side completion check fails, jump to the first bad step. */
  const showErrors = useCallback((fieldErrors: Record<string, string>) => {
    const index = firstIncompleteSectionIndex(fieldErrors);
    if (index >= 0) {
      const sectionQuestions = questionsForSection(SECTIONS[index]!.id);
      const scoped: Record<string, string> = {};
      for (const question of sectionQuestions) {
        if (fieldErrors[question.id]) scoped[question.id] = fieldErrors[question.id]!;
      }
      setStepIndex(index);
      setErrors(scoped);
    }
  }, []);

  const reset = useCallback((nextAnswers: Answers = {}, nextStep = 0) => {
    setAnswers(nextAnswers);
    setStepIndex(clampStep(nextStep));
    setErrors({});
  }, []);

  const progressPercent =
    TOTAL_REQUIRED === 0 ? 100 : Math.round((countAnsweredRequired(answers) / TOTAL_REQUIRED) * 100);
  const answeredTotal = countAnswered(answers);

  return {
    answers,
    stepIndex,
    errors,
    section,
    questions,
    stepCount,
    isLastStep,
    progressPercent,
    answeredTotal,
    setAnswer,
    goNext,
    goBack,
    validateStep,
    showErrors,
    reset,
  };
}
