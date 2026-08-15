"use client";

import { useCallback, useMemo, useState } from "react";
import type { AnswerValue, DiscoveryAnswers, DiscoveryQuestion } from "../types";

function hasValue(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return false;
}

/**
 * One-question-per-screen flow state, generic over any question list. Used
 * for both the 20-question mandatory Core flow and the optional 30-question
 * Deep flow — same mechanics, different question bank.
 */
export function useDiscoveryFlow(questions: DiscoveryQuestion[], initialAnswers: DiscoveryAnswers = {}) {
  const [answers, setAnswers] = useState<DiscoveryAnswers>(initialAnswers);
  const [index, setIndex] = useState(0);

  const total = questions.length;
  const question = questions[index]!;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  // Companies (and any other optional multi) question never blocks Continue.
  const currentAnswered = question.type === "multi" ? true : hasValue(answers[question.id]);

  const setAnswer = useCallback((questionId: string, value: AnswerValue) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  const goNext = useCallback(() => {
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length]);

  const goBack = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const progressPercent = useMemo(() => Math.round(((index + 1) / total) * 100), [index, total]);

  return {
    answers,
    index,
    total,
    question,
    isFirst,
    isLast,
    currentAnswered,
    progressPercent,
    setAnswer,
    goNext,
    goBack,
  };
}
