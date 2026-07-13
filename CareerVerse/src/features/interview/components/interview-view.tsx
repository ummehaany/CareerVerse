"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { InterviewPageData } from "../queries";
import type {
  InterviewDifficulty,
  InterviewEvaluation,
  InterviewQuestion,
} from "@/types/interview";
import { startInterview, submitInterview } from "../actions";
import { InterviewSetup } from "./interview-setup";
import { InterviewSession } from "./interview-session";
import { InterviewResults } from "./interview-results";
import { SectionHeading, LoadingPanel } from "@/components/shared/state-panels";
import { Alert } from "@/components/ui/alert";

type Phase = "setup" | "answering" | "evaluating" | "results";

export function InterviewView({ data }: { data: InterviewPageData }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("setup");
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  const [role, setRole] = useState("");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("mid");
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [evaluation, setEvaluation] = useState<InterviewEvaluation | null>(null);

  async function handleStart(
    nextRole: string,
    nextDifficulty: InterviewDifficulty,
    count: number,
  ) {
    setStarting(true);
    setError(null);
    const result = await startInterview({ role: nextRole, difficulty: nextDifficulty, count });
    setStarting(false);
    if (result.ok) {
      setRole(nextRole);
      setDifficulty(nextDifficulty);
      setQuestions(result.questions);
      setPhase("answering");
    } else {
      setError(result.error);
    }
  }

  async function handleSubmit(answers: Array<{ questionId: string; answer: string }>) {
    setPhase("evaluating");
    setError(null);
    const result = await submitInterview({ role, difficulty, questions, answers });
    if (result.ok) {
      setEvaluation(result.evaluation);
      setPhase("results");
      router.refresh();
    } else {
      setError(result.error);
      setPhase("answering");
    }
  }

  function handleNew() {
    setEvaluation(null);
    setQuestions([]);
    setError(null);
    setPhase("setup");
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 animate-fade-up">
      <SectionHeading
        title="Mock Interviews"
        description="Practice with role-based questions and get AI scoring and feedback."
      />

      {error && phase !== "results" && <Alert variant="error">{error}</Alert>}

      {phase === "setup" && <InterviewSetup data={data} onStart={handleStart} starting={starting} />}

      {phase === "answering" && (
        <InterviewSession role={role} questions={questions} onSubmit={handleSubmit} submitting={false} />
      )}

      {phase === "evaluating" && (
        <LoadingPanel
          title="Scoring your answers…"
          message="Our AI is reviewing each response and preparing feedback. This takes a few moments."
        />
      )}

      {phase === "results" && evaluation && (
        <InterviewResults role={role} questions={questions} evaluation={evaluation} onNew={handleNew} />
      )}
    </div>
  );
}
