import type { Answers, AnswerValue } from "@/types/assessment";
import type { Question, SectionId } from "./types";
import {
  QUESTIONS,
  SECTIONS,
  questionsForSection,
  TOTAL_QUESTIONS,
  TOTAL_REQUIRED,
} from "./questions";

function hasValue(value: AnswerValue | undefined): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return false;
}

/** Validate a single answer. Returns a helpful message, or null when valid. */
export function validateQuestion(question: Question, value: AnswerValue | undefined): string | null {
  const answered = hasValue(value);

  if (!answered) {
    return question.required ? requiredMessage(question) : null;
  }

  switch (question.type) {
    case "single":
      if (typeof value !== "string" || !value) return "Please select an option.";
      return null;

    case "scale":
      if (typeof value !== "number") return "Please choose a rating.";
      return null;

    case "multi": {
      const count = Array.isArray(value) ? value.length : 0;
      if (question.min && count < question.min) {
        return `Please select at least ${question.min} option${question.min > 1 ? "s" : ""}.`;
      }
      if (question.max && count > question.max) {
        return `Please select no more than ${question.max}.`;
      }
      return null;
    }

    case "text":
    case "longtext": {
      const text = typeof value === "string" ? value.trim() : "";
      if (question.minLength && text.length < question.minLength) {
        return `Please write at least ${question.minLength} characters.`;
      }
      if (question.maxLength && text.length > question.maxLength) {
        return `Please keep it under ${question.maxLength} characters.`;
      }
      return null;
    }

    default:
      return null;
  }
}

function requiredMessage(question: Question): string {
  switch (question.type) {
    case "multi":
      return question.min && question.min > 1
        ? `Please select at least ${question.min} options.`
        : "Please select at least one option.";
    case "scale":
      return "Please choose a rating.";
    case "single":
      return "Please select an option.";
    default:
      return "This field is required.";
  }
}

/** Validate every question in a section. */
export function validateSection(sectionId: SectionId, answers: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const question of questionsForSection(sectionId)) {
    const message = validateQuestion(question, answers[question.id]);
    if (message) errors[question.id] = message;
  }
  return errors;
}

/** Validate the whole assessment (used server-side as defense-in-depth). */
export function validateAll(answers: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const question of QUESTIONS) {
    const message = validateQuestion(question, answers[question.id]);
    if (message) errors[question.id] = message;
  }
  return errors;
}

/** Index of the first section that still has a validation error, or -1. */
export function firstIncompleteSectionIndex(errors: Record<string, string>): number {
  return SECTIONS.findIndex((section) =>
    questionsForSection(section.id).some((question) => errors[question.id]),
  );
}

/** Count of required questions that are validly answered. */
export function countAnsweredRequired(answers: Answers): number {
  return QUESTIONS.filter(
    (q) => q.required && validateQuestion(q, answers[q.id]) === null,
  ).length;
}

/** Count of all questions (required or not) that have a value. */
export function countAnswered(answers: Answers): number {
  return QUESTIONS.filter((q) => hasValue(answers[q.id])).length;
}

/** Progress toward completion, 0–100, based on required questions. */
export function computeProgress(answers: Answers): number {
  if (TOTAL_REQUIRED === 0) return 100;
  return Math.round((countAnsweredRequired(answers) / TOTAL_REQUIRED) * 100);
}

/** Rough estimate of minutes left based on unanswered questions. */
export function minutesRemaining(answers: Answers): number {
  const remaining = TOTAL_QUESTIONS - countAnswered(answers);
  return Math.max(1, Math.ceil((remaining * 18) / 60));
}
