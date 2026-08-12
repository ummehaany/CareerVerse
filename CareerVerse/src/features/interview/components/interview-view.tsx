"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { InterviewPageData } from "../queries";
import type { InterviewEvaluation, InterviewQuestion, InterviewType, InterviewDifficulty } from "@/types/interview";
import { startInterview, submitInterview } from "../actions";
import { interviewTypeMeta } from "../config";
import { loadDraft, saveDraft, clearDraft } from "../draft";
import { InterviewDashboard } from "./interview-dashboard";
import { InterviewSetup, type InterviewConfig } from "./interview-setup";
import { InterviewSession } from "./interview-session";
import { InterviewResults } from "./interview-results";
import { SectionHeading, LoadingPanel } from "@/components/shared/state-panels";
import { Alert } from "@/components/ui/alert";
import { openUpgradeDialog } from "@/features/subscription/events";

type Phase = "dashboard" | "setup" | "answering" | "evaluating" | "results";

interface Session {
  role: string;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  perQuestionSeconds: number;
  questions: InterviewQuestion[];
  initialAnswers?: Record<string, string>;
  initialIndex?: number;
}

export function InterviewView({ data }: { data: InterviewPageData }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("dashboard");
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const [session, setSession] = useState<Session | null>(null);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);
  const [source, setSource] = useState<"ai" | "offline">("ai");

  const [hasDraft, setHasDraft] = useState(false);
  const [draftLabel, setDraftLabel] = useState<string | null>(null);

  useEffect(() => {
    const draft = loadDraft();
    if (draft) {
      setHasDraft(true);
      setDraftLabel(`${interviewTypeMeta(draft.type).short} · ${draft.role}`);
    }
  }, []);

  async function handleStart(config: InterviewConfig) {
    setStarting(true);
    setError(null);
    const result = await startInterview({
      role: config.role,
      difficulty: config.difficulty,
      type: config.type,
      count: config.count,
    });
    setStarting(false);
    if (!result.ok) {
      if (result.limitReached) openUpgradeDialog(result.feature);
      else setError(result.error);
      return;
    }
    const next: Session = {
      role: config.role,
      type: config.type,
      difficulty: config.difficulty,
      perQuestionSeconds: config.perQuestionSeconds,
      questions: result.questions,
      initialAnswers: {},
      initialIndex: 0,
    };
    setSession(next);
    saveDraft({
      role: next.role,
      type: next.type,
      difficulty: next.difficulty,
      perQuestionSeconds: next.perQuestionSeconds,
      questions: next.questions,
      answers: {},
      index: 0,
      savedAt: Date.now(),
    });
    setPhase("answering");
  }

  function handleContinue() {
    const draft = loadDraft();
    if (!draft) {
      setHasDraft(false);
      return;
    }
    setSession({
      role: draft.role,
      type: draft.type,
      difficulty: draft.difficulty,
      perQuestionSeconds: draft.perQuestionSeconds,
      questions: draft.questions,
      initialAnswers: draft.answers,
      initialIndex: draft.index,
    });
    setPhase("answering");
  }

  function handleDiscardDraft() {
    clearDraft();
    setHasDraft(false);
    setDraftLabel(null);
  }

  const handleSessionChange = useCallback(
    (answers: Record<string, string>, index: number) => {
      setSession((prev) => {
        if (!prev) return prev;
        saveDraft({
          role: prev.role,
          type: prev.type,
          difficulty: prev.difficulty,
          perQuestionSeconds: prev.perQuestionSeconds,
          questions: prev.questions,
          answers,
          index,
          savedAt: Date.now(),
        });
        return prev;
      });
    },
    [],
  );

  async function handleSubmit(answers: Array<{ questionId: string; answer: string }>) {
    if (!session) return;
    setPhase("evaluating");
    setError(null);
    const result = await submitInterview({
      role: session.role,
      difficulty: session.difficulty,
      type: session.type,
      questions: session.questions,
      answers,
    });
    if (result.ok) {
      setEvaluation(result.evaluation);
      setSource(result.source);
      clearDraft();
      setHasDraft(false);
      setPhase("results");
      router.refresh();
    } else {
      setError(result.error);
      setPhase("answering");
    }
  }

  function handleNew() {
    setEvaluation(null);
    setSession(null);
    setError(null);
    setPhase("dashboard");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SectionHeading
        title="Mock Interviews"
        description="Practice type- and role-based interviews with a timer, then get AI feedback and analytics."
      />

      {error && phase !== "results" && <Alert variant="error">{error}</Alert>}

      {phase === "dashboard" && (
        <InterviewDashboard
          data={data}
          hasDraft={hasDraft}
          draftLabel={draftLabel}
          onStartNew={() => {
            setError(null);
            setPhase("setup");
          }}
          onContinue={handleContinue}
          onDiscardDraft={handleDiscardDraft}
        />
      )}

      {phase === "setup" && (
        <InterviewSetup data={data} onStart={handleStart} onBack={() => setPhase("dashboard")} starting={starting} />
      )}

      {phase === "answering" && session && (
        <InterviewSession
          role={session.role}
          type={session.type}
          perQuestionSeconds={session.perQuestionSeconds}
          questions={session.questions}
          initialAnswers={session.initialAnswers}
          initialIndex={session.initialIndex}
          onChange={handleSessionChange}
          onSubmit={handleSubmit}
          submitting={false}
        />
      )}

      {phase === "evaluating" && (
        <LoadingPanel
          title="Scoring your answers…"
          message="We're reviewing each response and preparing your feedback and skill breakdown."
        />
      )}

      {phase === "results" && evaluation && session && (
        <InterviewResults
          role={session.role}
          questions={session.questions}
          evaluation={evaluation}
          source={source}
          onNew={handleNew}
        />
      )}
    </div>
  );
}
