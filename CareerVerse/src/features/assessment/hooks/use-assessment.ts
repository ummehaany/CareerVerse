"use client";

import { useCallback, useMemo, useState } from "react";
import type { Answers, AnswerValue } from "@/types/assessment";
import type { Question, Section } from "../types";
import { QUESTIONS, SECTIONS, TOTAL_REQUIRED } from "../questions";
import { validateQuestion, countAnswered, countAnsweredRequired } from "../validation";

const SECTION_BY_ID = new Map<string, Section>(SECTIONS.map((s) => [s.id, s]));

function hasValue(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return false;
}

function clampIndex(index: number): number {
  return Math.min(Math.max(0, index), QUESTIONS.length - 1);
}

/** Furthest question index the user has already reached, from saved answers. */
function furthestAnswered(answers: Answers): number {
  let furthest = 0;
  QUESTIONS.forEach((q, i) => {
    if (hasValue(answers[q.id])) furthest = i;
  });
  return furthest;
}

/**
 * One-question-per-screen assessment state. Steps through the flat, ordered
 * question bank; the resume pointer (`index`) is a question index.
 */
export function useAssessment(initialAnswers: Answers, initialStep: number) {
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [index, setIndex] = useState<number>(clampIndex(initialStep));
  const [maxReached, setMaxReached] = useState<number>(
    Math.max(clampIndex(initialStep), furthestAnswered(initialAnswers)),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const total = QUESTIONS.length;
  const question: Question = QUESTIONS[index]!;
  const section: Section = SECTION_BY_ID.get(question.section)!;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const currentError = errors[question.id];

  const setAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
    setErrors((prev) => {
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  const validateCurrent = useCallback((): boolean => {
    const message = validateQuestion(question, answers[question.id]);
    setErrors(message ? { [question.id]: message } : {});
    return !message;
  }, [question, answers]);

  const advanceTo = useCallback((nextIndex: number) => {
    const clamped = clampIndex(nextIndex);
    setIndex(clamped);
    setMaxReached((m) => Math.max(m, clamped));
  }, []);

  const goNext = useCallback((): boolean => {
    if (!validateCurrent()) return false;
    if (index < QUESTIONS.length - 1) advanceTo(index + 1);
    return true;
  }, [validateCurrent, index, advanceTo]);

  const goBack = useCallback(() => {
    setErrors({});
    setIndex((i) => clampIndex(i - 1));
  }, []);

  /** Jump to any question already reached (used by the review panel). */
  const goTo = useCallback(
    (target: number) => {
      setErrors({});
      setIndex(Math.min(clampIndex(target), maxReached));
    },
    [maxReached],
  );

  /** After a server completion check fails, jump to the first bad answer. */
  const showErrors = useCallback((fieldErrors: Record<string, string>) => {
    const firstIndex = QUESTIONS.findIndex((q) => fieldErrors[q.id]);
    if (firstIndex >= 0) {
      const q = QUESTIONS[firstIndex]!;
      setIndex(firstIndex);
      setMaxReached((m) => Math.max(m, firstIndex));
      setErrors({ [q.id]: fieldErrors[q.id]! });
    }
  }, []);

  const reset = useCallback((nextAnswers: Answers = {}, nextStep = 0) => {
    setAnswers(nextAnswers);
    setIndex(clampIndex(nextStep));
    setMaxReached(Math.max(clampIndex(nextStep), furthestAnswered(nextAnswers)));
    setErrors({});
  }, []);

  const progressPercent =
    TOTAL_REQUIRED === 0
      ? 100
      : Math.round((countAnsweredRequired(answers) / TOTAL_REQUIRED) * 100);
  const answeredTotal = countAnswered(answers);

  /** Questions the user has reached — for the review-and-edit panel. */
  const visited = useMemo(
    () => QUESTIONS.slice(0, maxReached + 1).map((q, i) => ({ question: q, index: i })),
    [maxReached],
  );

  return {
    answers,
    index,
    total,
    question,
    section,
    isFirst,
    isLast,
    errors,
    currentError,
    maxReached,
    visited,
    progressPercent,
    answeredTotal,
    setAnswer,
    goNext,
    goBack,
    goTo,
    validateCurrent,
    showErrors,
    reset,
  };
}
