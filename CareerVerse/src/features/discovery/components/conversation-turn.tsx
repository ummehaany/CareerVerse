"use client";

import { SparklesIcon } from "@/components/ui/icon";
import { OptionCardGroup } from "@/features/assessment/components/option-card-group";
import { ChipSelect } from "@/features/assessment/components/chip-select";
import { ScaleInput } from "@/features/assessment/components/scale-input";
import { TextQuestion } from "@/features/assessment/components/text-question";
import type { AnswerValue, Question } from "@/features/assessment/types";
import { VoiceInput } from "./voice-input";

function selectionHint(question: Question): string | null {
  if (question.type !== "multi") return null;
  const { min, max } = question;
  if (min && max) return min === max ? `Choose ${min}` : `Choose ${min}–${max}`;
  if (max) return `Choose up to ${max}`;
  if (min) return `Choose at least ${min}`;
  return null;
}

export function ConversationTurn({
  question,
  transition,
  value,
  error,
  onChange,
}: {
  question: Question;
  transition: string | null;
  value: AnswerValue | undefined;
  error?: string;
  onChange: (value: AnswerValue) => void;
}) {
  const invalid = Boolean(error);
  const hint = selectionHint(question);
  const isText = question.type === "text" || question.type === "longtext";

  return (
    <div className="animate-fade-up">
      {transition && <p className="mb-3 text-sm font-medium text-primary">{transition}</p>}

      {/* AI message bubble */}
      <div className="mb-5 flex items-start gap-3">
        <span
          className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
          style={{ background: "linear-gradient(135deg, var(--accent-assessment), var(--accent-mentor))" }}
          aria-hidden="true"
        >
          <SparklesIcon size={18} />
        </span>
        <div className="rounded-2xl rounded-tl-sm border border-border bg-background px-4 py-3 shadow-sm">
          <p className="text-[15px] font-semibold leading-snug">{question.title}</p>
          {(question.helpText || hint) && (
            <p className="mt-1 text-sm text-muted">
              {question.helpText}
              {question.helpText && hint ? " · " : ""}
              {hint}
            </p>
          )}
        </div>
      </div>

      {/* Answer input */}
      <div className="pl-0 sm:pl-12">
        {question.type === "scale" && (
          <ScaleInput scale={question.scale!} value={value} onChange={onChange} invalid={invalid} groupLabel={question.title} />
        )}
        {isText && (
          <div className="space-y-3">
            <TextQuestion question={question} value={value} onChange={onChange} invalid={invalid} />
            <VoiceInput
              onTranscript={(text) => {
                const existing = typeof value === "string" ? value : "";
                onChange(existing ? `${existing} ${text}` : text);
              }}
            />
          </div>
        )}
        {question.type === "single" && (
          <OptionCardGroup options={question.options ?? []} value={value} multiple={false} onChange={onChange} invalid={invalid} groupLabel={question.title} />
        )}
        {question.type === "multi" &&
          (question.display === "chips" ? (
            <ChipSelect options={question.options ?? []} value={value} max={question.max} onChange={onChange} groupLabel={question.title} />
          ) : (
            <OptionCardGroup options={question.options ?? []} value={value} multiple max={question.max} onChange={onChange} invalid={invalid} groupLabel={question.title} />
          ))}

        {invalid && (
          <p role="alert" className="mt-3 text-sm font-medium text-danger">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
