"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { OptionCardGroup } from "@/features/assessment/components/option-card-group";
import { ChipSelect } from "@/features/assessment/components/chip-select";
import { ScaleInput } from "@/features/assessment/components/scale-input";
import { TextQuestion } from "@/features/assessment/components/text-question";
import type { AnswerValue, Answers, Question } from "@/features/assessment/types";
import { completeAssessment, saveAssessmentProgress } from "@/features/assessment/actions";
import {
  buildProgress,
  fallbackReply,
  isAboutYou,
  nextConversationStep,
  topicIntent,
} from "../engine";
import { discoveryBridge, discoveryOpening } from "../actions";
import { MentorIntro } from "./mentor-intro";
import { ChatBubble, TypingBubble } from "./chat-bubble";
import { ProgressRail } from "./progress-rail";
import { ThinkingScreen } from "./thinking-screen";
import { VoiceInput } from "./voice-input";

type Stage = "intro" | "chat" | "thinking";
interface Msg { id: string; role: "ai" | "user"; text: string }

let msgSeq = 0;
const mkMsg = (role: "ai" | "user", text: string): Msg => ({ id: `m${msgSeq++}`, role, text });

function labelsFor(question: Question, values: string[]): string[] {
  return values.map((v) => question.options?.find((o) => o.value === v)?.label ?? v);
}

function summarize(question: Question, value: AnswerValue | undefined): string {
  if (value === undefined || value === "" || (Array.isArray(value) && value.length === 0)) {
    return "I'd rather skip that one.";
  }
  if (Array.isArray(value)) return labelsFor(question, value).join(", ");
  if (typeof value === "number") return `${value} / ${question.scale?.max ?? 5}`;
  const opt = question.options?.find((o) => o.value === value);
  return opt?.label ?? String(value);
}

function isRequiredUnmet(question: Question, value: AnswerValue | undefined): boolean {
  if (!question.required) return false;
  if (question.type === "multi") return !Array.isArray(value) || value.length < (question.min ?? 1);
  if (question.type === "scale") return typeof value !== "number";
  if (question.type === "text" || question.type === "longtext") return !(typeof value === "string" && value.trim());
  return !(typeof value === "string" && value);
}

const MENTOR_INTRO_TEXT =
  "Awesome — let's do this. To start, tell me a bit about yourself: what you're into, what you're studying or doing, and what you're hoping for. Type it, speak it, or skip if you'd rather jump straight in.";

export function DiscoveryExperience({
  firstName,
  initialDraft,
  aiAvailable,
}: {
  firstName: string;
  initialDraft: { id: string; answers: Answers } | null;
  aiAvailable: boolean;
}) {
  const router = useRouter();
  const resuming = Boolean(initialDraft && Object.keys(initialDraft.answers).length > 0);

  const [stage, setStage] = useState<Stage>("intro");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [answers, setAnswers] = useState<Answers>(initialDraft?.answers ?? {});
  const [current, setCurrent] = useState<Question | null>(null);
  const [draftValue, setDraftValue] = useState<AnswerValue | undefined>(undefined);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const draftId = useRef<string | null>(initialDraft?.id ?? null);
  const extractedInterests = useRef<string[]>([]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, current, pending]);

  const persist = useCallback((next: Answers) => {
    void saveAssessmentProgress({ id: draftId.current, currentStep: Object.keys(next).length, answers: next }).then(
      (r) => {
        if (r.ok) draftId.current = r.id;
      },
    );
  }, []);

  const finish = useCallback(
    (finalAnswers: Answers) => {
      setStage("thinking");
      const started = Date.now();
      void completeAssessment({
        id: draftId.current,
        currentStep: Object.keys(finalAnswers).length,
        answers: finalAnswers,
      }).then((res) => {
        const wait = Math.max(0, 3600 - (Date.now() - started));
        if (res.ok) {
          setTimeout(() => {
            router.push(ROUTES.assessment);
            router.refresh();
          }, wait);
        } else {
          setError(res.error);
          setStage("chat");
        }
      });
    },
    [router],
  );

  /** Show the mentor's reply, then reveal the next question (or finish). */
  const goToNext = useCallback(
    async (nextAnswers: Answers, prev: Question | null, lastSummary: string, opening: boolean) => {
      const step = nextConversationStep(nextAnswers);
      if (!step) {
        finish(nextAnswers);
        return;
      }
      setPending(true);
      let reply: string;
      if (opening) {
        const res = await discoveryOpening(lastSummary);
        if (res.interests.length >= 3) extractedInterests.current = res.interests;
        reply = res.reply;
      } else if (aiAvailable) {
        const fb = fallbackReply(prev, step.question);
        const res = await discoveryBridge({
          lastAnswer: lastSummary,
          nextPrompt: topicIntent(step.question),
          isCards: step.question.type === "single" || step.question.type === "multi",
          fallback: fb,
        });
        reply = res.reply;
      } else {
        reply = fallbackReply(prev, step.question);
      }
      setMessages((m) => [...m, mkMsg("ai", reply)]);
      setCurrent(step.question);
      // Pre-fill the interests card with what we parsed from their intro.
      const seed =
        step.question.id === "interestAreas" && extractedInterests.current.length
          ? [...extractedInterests.current]
          : nextAnswers[step.question.id];
      setDraftValue(seed);
      setPending(false);
    },
    [aiAvailable, finish],
  );

  const begin = useCallback(() => {
    setStage("chat");
    setMessages([
      mkMsg("ai", `Hi ${firstName}! 👋 I'm your AI Career Mentor. There are no right or wrong answers here — let's just talk.`),
      mkMsg("ai", MENTOR_INTRO_TEXT),
    ]);
    const step = nextConversationStep(answers);
    setCurrent(step?.question ?? null);
    setDraftValue(step ? answers[step.question.id] : undefined);
  }, [firstName, answers]);

  // Resume mid-conversation.
  useEffect(() => {
    if (resuming && stage === "intro") begin();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submit = useCallback(async () => {
    if (!current || pending) return;
    if (isRequiredUnmet(current, draftValue)) {
      setError("Just need a little here to keep going.");
      return;
    }
    setError(null);
    const committed: AnswerValue = draftValue ?? (current.type === "multi" ? [] : "");
    const nextAnswers: Answers = { ...answers, [current.id]: committed };
    const summary = summarize(current, committed);
    const opening = isAboutYou(current);

    setMessages((m) => [...m, mkMsg("user", summary)]);
    setAnswers(nextAnswers);
    persist(nextAnswers);
    const prev = current;
    setCurrent(null);
    setDraftValue(undefined);
    await goToNext(nextAnswers, prev, opening ? (typeof committed === "string" ? committed : "") : summary, opening);
  }, [current, draftValue, answers, pending, persist, goToNext]);

  const skip = useCallback(async () => {
    if (!current || current.required || pending) return;
    setError(null);
    const committed: AnswerValue = current.type === "multi" ? [] : "";
    const nextAnswers: Answers = { ...answers, [current.id]: committed };
    setMessages((m) => [...m, mkMsg("user", "I'd rather skip that one.")]);
    setAnswers(nextAnswers);
    persist(nextAnswers);
    const prev = current;
    setCurrent(null);
    setDraftValue(undefined);
    await goToNext(nextAnswers, prev, isAboutYou(current) ? "" : "(skipped)", isAboutYou(current));
  }, [current, answers, pending, persist, goToNext]);

  if (stage === "intro") return <MentorIntro firstName={firstName} onBegin={begin} />;
  if (stage === "thinking") return <ThinkingScreen />;

  const phases = buildProgress(answers, false);
  const isText = current && (current.type === "text" || current.type === "longtext");

  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-4 py-8 lg:grid-cols-[1fr_240px]">
      <div className="order-2 min-w-0 lg:order-1">
        <div className="space-y-4">
          {messages.map((m) => (
            <ChatBubble key={m.id} role={m.role}>
              {m.text}
            </ChatBubble>
          ))}
          {pending && <TypingBubble />}
        </div>

        {/* Current input */}
        {current && !pending && (
          <div className="mt-5 pl-0 sm:pl-12">
            {current.type === "scale" && (
              <ScaleInput scale={current.scale!} value={draftValue} onChange={setDraftValue} groupLabel={current.title} />
            )}
            {isText && (
              <div className="space-y-3">
                <TextQuestion question={current} value={draftValue} onChange={setDraftValue} />
                <VoiceInput
                  onTranscript={(t) => {
                    const existing = typeof draftValue === "string" ? draftValue : "";
                    setDraftValue(existing ? `${existing} ${t}` : t);
                  }}
                />
              </div>
            )}
            {current.type === "single" && (
              <OptionCardGroup options={current.options ?? []} value={draftValue} multiple={false} onChange={setDraftValue} groupLabel={current.title} />
            )}
            {current.type === "multi" &&
              (current.display === "chips" ? (
                <ChipSelect options={current.options ?? []} value={draftValue} max={current.max} onChange={setDraftValue} groupLabel={current.title} />
              ) : (
                <OptionCardGroup options={current.options ?? []} value={draftValue} multiple max={current.max} onChange={setDraftValue} groupLabel={current.title} />
              ))}

            {error && <p role="alert" className="mt-3 text-sm font-medium text-danger">{error}</p>}

            <div className="mt-4 flex items-center gap-3">
              <Button onClick={submit}>Continue</Button>
              {!current.required && (
                <Button variant="ghost" onClick={skip}>
                  Skip
                </Button>
              )}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <aside className="order-1 lg:order-2">
        <div className="rounded-2xl border border-border bg-background p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-subtle">Your discovery</p>
          <ProgressRail phases={phases} />
        </div>
      </aside>
    </div>
  );
}
