"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { BASIC_QUESTIONS, ADVANCED_QUESTIONS } from "../questions";
import { scoreCareerDiscovery } from "../scoring";
import { organizationOptionsForField } from "../organizations";
import { completeBasicDiscovery, completeAdvancedDiscovery } from "../actions";
import { DiscoveryIntro } from "./discovery-intro";
import { DiscoveryAnalysis } from "./discovery-analysis";
import { QuestionFlow } from "./question-flow";
import { CuriosityStep } from "./curiosity-step";
import { DiscoveryResults } from "./discovery-results";
import type { CareerMatch, DiscoveryAnswers, DiscoveryQuestion, FieldId } from "../types";

type Phase = "intro" | "basic" | "curiosity" | "analysis" | "results" | "advanced" | "analysis2";

/** Resolves the adaptive organizations question from the student's field answer so far. */
function resolveDynamic(question: DiscoveryQuestion, answers: DiscoveryAnswers) {
  if (question.dynamicSource !== "organizations") return { options: [] };
  const fieldId = typeof answers.fieldInterest === "string" ? (answers.fieldInterest as FieldId) : null;
  return organizationOptionsForField(fieldId);
}

/**
 * Ranks 4–6 of the full sorted catalog — the top 3 already shown as
 * `CareerMatch` cards are always `all.slice(0, 3)`, so this never overlaps.
 * Surfaced as a lightweight "Other careers to explore" list so a student
 * whose answers carry more than one signal (e.g. tech-leaning but also
 * business/leadership) can see that reflected somewhere, without changing
 * what the top 3 are or forcing artificial diversity into them.
 */
function exploreMoreFrom(basic: DiscoveryAnswers, advanced: DiscoveryAnswers | null): CareerMatch[] {
  return scoreCareerDiscovery(basic, advanced).all.slice(3, 6);
}

export function DiscoveryFlow({
  initialCompleted,
  initialAdvancedCompleted,
  initialRecommendations,
  initialBasicAnswers,
  initialAdvancedAnswers,
  initialAssessmentId,
  initialCuriosityNote,
  forceRetake,
}: {
  initialCompleted: boolean;
  initialAdvancedCompleted: boolean;
  initialRecommendations: CareerMatch[] | null;
  initialBasicAnswers: DiscoveryAnswers | null;
  initialAdvancedAnswers: DiscoveryAnswers | null;
  initialAssessmentId: string | null;
  initialCuriosityNote: string | null;
  forceRetake: boolean;
}) {
  const router = useRouter();
  const startInResults = initialCompleted && !forceRetake;

  const [phase, setPhase] = useState<Phase>(startInResults ? "results" : "intro");
  const [basicAnswers, setBasicAnswers] = useState<DiscoveryAnswers>(initialBasicAnswers ?? {});
  const [curiosityNote, setCuriosityNote] = useState<string>(initialCuriosityNote ?? "");
  const [recommendations, setRecommendations] = useState<CareerMatch[]>(initialRecommendations ?? []);
  const [exploreMore, setExploreMore] = useState<CareerMatch[]>(() =>
    startInResults && initialBasicAnswers ? exploreMoreFrom(initialBasicAnswers, initialAdvancedAnswers) : [],
  );
  const [advancedCompleted, setAdvancedCompleted] = useState(startInResults && initialAdvancedCompleted);
  const [assessmentId, setAssessmentId] = useState<string | null>(initialAssessmentId);
  const [saveError, setSaveError] = useState<string | null>(null);

  function handleBasicComplete(answers: DiscoveryAnswers) {
    setBasicAnswers(answers);
    setPhase("curiosity");
  }

  function finishBasic(answers: DiscoveryAnswers, note: string) {
    const result = scoreCareerDiscovery(answers, null);
    setRecommendations(result.top);
    setExploreMore(result.all.slice(3, 6));
    setSaveError(null);
    setPhase("analysis");

    completeBasicDiscovery({ answers, curiosityNote: note || undefined })
      .then((res) => {
        if (res.ok) {
          setAssessmentId(res.assessmentId);
          router.refresh();
        } else {
          setSaveError(res.error);
        }
      })
      .catch(() => setSaveError("We couldn't save your results just now. Your matches are still shown below."));
  }

  function handleAdvancedComplete(advancedAnswers: DiscoveryAnswers) {
    const result = scoreCareerDiscovery(basicAnswers, advancedAnswers);
    setRecommendations(result.top);
    setExploreMore(result.all.slice(3, 6));
    setAdvancedCompleted(true);
    setSaveError(null);
    setPhase("analysis2");

    if (assessmentId) {
      completeAdvancedDiscovery({
        assessmentId,
        basicAnswers,
        advancedAnswers,
        curiosityNote: curiosityNote || undefined,
      })
        .then((res) => {
          if (res.ok) router.refresh();
          else setSaveError(res.error);
        })
        .catch(() => setSaveError("We couldn't save your refined results just now. Your matches are still shown below."));
    }
  }

  function handleRetake() {
    setBasicAnswers({});
    setCuriosityNote("");
    setRecommendations([]);
    setExploreMore([]);
    setAdvancedCompleted(false);
    setSaveError(null);
    setPhase("intro");
  }

  if (phase === "intro") {
    return (
      <DiscoveryIntro
        alreadyCompleted={initialCompleted}
        onStart={() => setPhase("basic")}
        onViewResults={() => setPhase("results")}
      />
    );
  }

  if (phase === "basic") {
    return (
      <QuestionFlow
        questions={BASIC_QUESTIONS}
        initialAnswers={basicAnswers}
        resolveDynamic={resolveDynamic}
        onComplete={handleBasicComplete}
        onExit={() => setPhase("intro")}
        finishLabel="Almost done"
      />
    );
  }

  if (phase === "curiosity") {
    return (
      <CuriosityStep
        initialValue={curiosityNote}
        onSubmit={(note) => {
          setCuriosityNote(note);
          finishBasic(basicAnswers, note);
        }}
      />
    );
  }

  if (phase === "analysis") {
    return <DiscoveryAnalysis onDone={() => setPhase("results")} />;
  }

  if (phase === "advanced") {
    return (
      <QuestionFlow
        questions={ADVANCED_QUESTIONS}
        onComplete={handleAdvancedComplete}
        onExit={() => setPhase("results")}
        finishLabel="Refine my results"
      />
    );
  }

  if (phase === "analysis2") {
    return <DiscoveryAnalysis onDone={() => setPhase("results")} durationMs={3200} />;
  }

  return (
    <div className="space-y-4">
      {saveError && (
        <div className="mx-auto max-w-4xl">
          <Alert variant="error">{saveError}</Alert>
        </div>
      )}
      <DiscoveryResults
        matches={recommendations}
        exploreMore={exploreMore}
        advancedCompleted={advancedCompleted}
        onStartAdvanced={() => setPhase("advanced")}
        onRetake={handleRetake}
      />
    </div>
  );
}
