"use client";

import type { AnswerValue, Question } from "../types";
import { OptionCardGroup } from "./option-card-group";
import { ChipSelect } from "./chip-select";
import { ScaleInput } from "./scale-input";
import { TextQuestion } from "./text-question";
import { cn } from "@/lib/utils";

function selectionHint(question: Question): string | null {
  if (question.type !== "multi") return null;
  const { min, max } = question;
  if (min && max) return min === max ? `Choose ${min}` : `Choose ${min}–${max}`;
  if (max) return `Choose up to ${max}`;
  if (min) return `Choose at least ${min}`;
  return null;
}

export function QuestionField({
  question,
  value,
  error,
  onChange,
}: {
  question: Question;
  value: AnswerValue | undefined;
  error?: string;
  onChange: (value: AnswerValue) => void;
}) {
  const invalid = Boolean(error);
  const errorId = `${question.id}-error`;
  const hint = selectionHint(question);

  function renderInput() {
    switch (question.type) {
      case "scale":
        return (
          <ScaleInput
            scale={question.scale!}
            value={value}
            onChange={onChange}
            invalid={invalid}
            groupLabel={question.title}
          />
        );
      case "text":
      case "longtext":
        return <TextQuestion question={question} value={value} onChange={onChange} invalid={invalid} />;
      case "single":
        return (
          <OptionCardGroup
            options={question.options ?? []}
            value={value}
            multiple={false}
            onChange={onChange}
            invalid={invalid}
            groupLabel={question.title}
          />
        );
      case "multi":
        return question.display === "chips" ? (
          <ChipSelect
            options={question.options ?? []}
            value={value}
            max={question.max}
            onChange={onChange}
            groupLabel={question.title}
          />
        ) : (
          <OptionCardGroup
            options={question.options ?? []}
            value={value}
            multiple
            max={question.max}
            onChange={onChange}
            invalid={invalid}
            groupLabel={question.title}
          />
        );
      default:
        return null;
    }
  }

  return (
    <fieldset
      className={cn(
        "rounded-2xl border bg-background p-5 transition-colors sm:p-6",
        invalid ? "border-danger/40" : "border-border",
      )}
      aria-describedby={invalid ? errorId : undefined}
    >
      <legend className="text-[15px] font-semibold leading-snug">
        {question.title}
        {question.required && <span className="text-danger"> *</span>}
      </legend>

      {(question.helpText || hint) && (
        <p className="mt-1.5 text-sm text-muted">
          {question.helpText}
          {question.helpText && hint ? " · " : ""}
          {hint}
        </p>
      )}

      <div className="mt-4">{renderInput()}</div>

      {invalid && (
        <p id={errorId} role="alert" className="mt-3 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </fieldset>
  );
}
