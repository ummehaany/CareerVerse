"use client";

import { OptionCardGroup } from "../../components/option-card-group";
import { ChipSelect } from "../../components/chip-select";
import type { AnswerValue, DiscoveryOption, DiscoveryQuestion } from "../types";

/** UI components only read value/label/description/icon — weights are scoring-only. */
function forUi(options: DiscoveryOption[]) {
  return options.map(({ value, label, description, icon }) => ({ value, label, description, icon }));
}

export function DiscoveryQuestionView({
  question,
  value,
  onChange,
  dynamicOptions,
}: {
  question: DiscoveryQuestion;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  /** Populated options for questions with `dynamicSource` (e.g. companies). */
  dynamicOptions?: DiscoveryOption[];
}) {
  const options = question.dynamicSource ? (dynamicOptions ?? []) : question.options;
  const uiOptions = forUi(options);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">{question.title}</h2>
        {question.helpText && <p className="mt-1.5 text-sm text-muted">{question.helpText}</p>}
      </div>

      {question.searchable ? (
        <ChipSelect options={uiOptions} value={value} max={question.max} onChange={onChange} groupLabel={question.title} />
      ) : (
        <OptionCardGroup
          options={uiOptions}
          value={value}
          multiple={question.type === "multi"}
          max={question.max}
          onChange={onChange}
          groupLabel={question.title}
        />
      )}
    </div>
  );
}
