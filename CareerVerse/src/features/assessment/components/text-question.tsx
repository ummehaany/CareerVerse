"use client";

import type { AnswerValue, Question } from "../types";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function TextQuestion({
  question,
  value,
  onChange,
  invalid,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  invalid?: boolean;
}) {
  const text = typeof value === "string" ? value : "";

  if (question.type === "longtext") {
    return (
      <div>
        <Textarea
          id={question.id}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          placeholder={question.placeholder}
          aria-invalid={invalid || undefined}
          maxLength={question.maxLength}
        />
        {question.maxLength && (
          <div className="mt-1.5 text-right text-xs tabular-nums text-subtle">
            {text.length}/{question.maxLength}
          </div>
        )}
      </div>
    );
  }

  return (
    <Input
      id={question.id}
      value={text}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder}
      aria-invalid={invalid || undefined}
      maxLength={question.maxLength}
    />
  );
}
