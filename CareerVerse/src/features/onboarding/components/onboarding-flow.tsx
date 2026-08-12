"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { SparklesIcon, ArrowRightIcon, ChevronLeftIcon } from "@/components/ui/icon";
import { ROUTES } from "@/config/routes";
import {
  CAREER_GOALS,
  CAREER_FIELDS,
  CAREER_FIELD_UNDECIDED,
  CAREER_FIELD_UNDECIDED_OPTION,
  CURRENT_LEVELS,
  TARGET_COMPANIES,
  PERSONALIZATION_MESSAGES,
} from "../flow-config";
import { completeOnboardingAction, skipOnboardingAction } from "../actions";
import { SelectableCard } from "./selectable-card";
import { SearchableOptions } from "./searchable-options";
import { AIPersonalizing } from "./ai-personalizing";

interface Answers {
  careerGoal: string | null;
  careerField: string | null;
  currentLevel: string | null;
  targetCompanies: string[];
}

const QUESTION_TITLES: Record<number, string> = {
  1: "What are you looking for?",
  2: "Which field interests you the most?",
  3: "Where are you currently?",
  4: "Which companies are you targeting?",
};

const TOTAL_QUESTIONS = 4;

export function OnboardingFlow({ initial }: { initial: Answers }) {
  const router = useRouter();
  const [step, setStep] = useState(0); // 0 welcome · 1–4 questions · 5 personalizing
  const [answers, setAnswers] = useState<Answers>(initial);
  const [skipping, setSkipping] = useState(false);
  const [finalError, setFinalError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const answersRef = useRef(answers);
  answersRef.current = answers;
  const savePromise = useRef<Promise<{ ok: boolean }> | null>(null);

  // Kick off the real save when the personalizing step begins (and on retry).
  useEffect(() => {
    if (step !== 5) return;
    savePromise.current = completeOnboardingAction(answersRef.current);
  }, [step, attempt]);

  const handleDone = useCallback(async () => {
    const result = await (savePromise.current ?? completeOnboardingAction(answersRef.current));
    if (result.ok) {
      router.push(ROUTES.dashboard);
      router.refresh();
    } else {
      setFinalError("We couldn't save your setup. Please try again.");
    }
  }, [router]);

  async function handleSkip() {
    setSkipping(true);
    await skipOnboardingAction();
    router.push(ROUTES.dashboard);
    router.refresh();
  }

  const canNext =
    (step === 1 && Boolean(answers.careerGoal)) ||
    (step === 2 && Boolean(answers.careerField)) ||
    (step === 3 && Boolean(answers.currentLevel)) ||
    step === 4;

  function next() {
    setStep((s) => Math.min(5, s + 1));
  }
  function back() {
    setStep((s) => Math.max(1, s - 1));
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-gradient-to-b from-primary/5 via-background to-background">
      <header className="mx-auto flex w-full max-w-lg items-center gap-2 px-4 py-5">
        <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
          <SparklesIcon size={16} />
        </span>
        <span className="text-sm font-semibold tracking-tight">CareerVerse</span>
      </header>

      <div className="mx-auto flex w-full max-w-lg flex-1 flex-col px-4 pb-10">
        {step >= 1 && step <= TOTAL_QUESTIONS && (
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-xs font-medium text-subtle">
              <span>
                Step {step} of {TOTAL_QUESTIONS}
              </span>
              <span>{Math.round((step / TOTAL_QUESTIONS) * 100)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/10">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${(step / TOTAL_QUESTIONS) * 100}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex flex-1 flex-col justify-center">
          {/* Step 1 — Welcome */}
          {step === 0 && (
            <div key="welcome" className="animate-fade-up text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                <SparklesIcon size={30} />
              </span>
              <h1 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl">
                Welcome to CareerVerse 👋
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted sm:text-base">
                Let&apos;s personalize your career journey in less than a minute.
              </p>
              <div className="mt-8 flex flex-col items-center gap-3">
                <Button size="lg" onClick={() => setStep(1)} className="w-full sm:w-auto">
                  Get Started <ArrowRightIcon size={18} />
                </Button>
                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={skipping}
                  className="text-sm font-medium text-subtle transition-colors hover:text-foreground disabled:opacity-50"
                >
                  {skipping ? "Skipping…" : "Skip setup"}
                </button>
              </div>
            </div>
          )}

          {/* Steps 2–5 — Questions */}
          {step >= 1 && step <= TOTAL_QUESTIONS && (
            <div key={step} className="animate-fade-up">
              <h1 className="text-xl font-bold tracking-tight sm:text-2xl">{QUESTION_TITLES[step]}</h1>

              {step === 1 && (
                <div className="mt-5 grid gap-3">
                  {CAREER_GOALS.map((g) => (
                    <SelectableCard
                      key={g.value}
                      emoji={g.emoji}
                      label={g.label}
                      description={g.description}
                      selected={answers.careerGoal === g.value}
                      onSelect={() => setAnswers((a) => ({ ...a, careerGoal: g.value }))}
                    />
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="mt-5 space-y-4">
                  <SearchableOptions
                    mode="single"
                    options={CAREER_FIELDS}
                    selected={
                      answers.careerField && answers.careerField !== CAREER_FIELD_UNDECIDED
                        ? [answers.careerField]
                        : []
                    }
                    onChange={(next) => setAnswers((a) => ({ ...a, careerField: next[0] ?? null }))}
                    placeholder="Search fields…"
                  />
                  <SelectableCard
                    emoji={CAREER_FIELD_UNDECIDED_OPTION.emoji}
                    label={CAREER_FIELD_UNDECIDED_OPTION.label}
                    description={CAREER_FIELD_UNDECIDED_OPTION.description}
                    selected={answers.careerField === CAREER_FIELD_UNDECIDED}
                    onSelect={() => setAnswers((a) => ({ ...a, careerField: CAREER_FIELD_UNDECIDED }))}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {CURRENT_LEVELS.map((l) => (
                    <SelectableCard
                      key={l.value}
                      emoji={l.emoji}
                      label={l.label}
                      selected={answers.currentLevel === l.value}
                      onSelect={() => setAnswers((a) => ({ ...a, currentLevel: l.value }))}
                    />
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="mt-3">
                  <p className="mb-4 text-sm text-muted">
                    Pick any that inspire you — we&apos;ll use them to personalize recommendations.
                    You can change these later.
                  </p>
                  <SearchableOptions
                    mode="multi"
                    options={TARGET_COMPANIES}
                    selected={answers.targetCompanies}
                    onChange={(next) => setAnswers((a) => ({ ...a, targetCompanies: next }))}
                    placeholder="Search companies…"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 6 — AI personalization */}
          {step === 5 && (
            <div className="animate-fade-up">
              {finalError ? (
                <div className="text-center">
                  <Alert variant="error">{finalError}</Alert>
                  <div className="mt-4 flex justify-center gap-2">
                    <Button
                      onClick={() => {
                        setFinalError(null);
                        setAttempt((n) => n + 1);
                      }}
                    >
                      Try again
                    </Button>
                    <Button variant="outline" onClick={handleSkip} disabled={skipping}>
                      Continue to dashboard
                    </Button>
                  </div>
                </div>
              ) : (
                <AIPersonalizing
                  key={attempt}
                  messages={PERSONALIZATION_MESSAGES}
                  onDone={handleDone}
                />
              )}
            </div>
          )}
        </div>

        {/* Footer nav (question steps only) */}
        {step >= 1 && step <= TOTAL_QUESTIONS && (
          <div className="mt-8 flex items-center justify-between gap-3">
            <Button variant="ghost" onClick={back} disabled={step === 1}>
              <ChevronLeftIcon size={16} /> Back
            </Button>
            <Button onClick={next} disabled={!canNext}>
              {step === TOTAL_QUESTIONS ? "Finish" : "Next"} <ArrowRightIcon size={16} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
