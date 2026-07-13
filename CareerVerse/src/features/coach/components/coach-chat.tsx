"use client";

import { useEffect, useRef, useState } from "react";
import type { CoachPageData } from "../queries";
import type { CoachMessageView } from "@/types/coach";
import { sendCoachMessage } from "../actions";
import { SectionHeading } from "@/components/shared/state-panels";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { SparklesIcon, ArrowRightIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

const SUGGESTIONS = [
  "What career path fits me best?",
  "How do I close my biggest skill gap?",
  "What should I focus on this month?",
  "Explain my top career match.",
];

export function CoachChat({ data }: { data: CoachPageData }) {
  const [messages, setMessages] = useState<CoachMessageView[]>(data.messages);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sending]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || sending) return;
    setInput("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content }]);
    setSending(true);
    const result = await sendCoachMessage({ content });
    setSending(false);
    if (result.ok) {
      setMessages((prev) => [...prev, { role: "assistant", content: result.reply }]);
    } else {
      setError(result.error);
    }
  }

  const empty = messages.length === 0;

  return (
    <div className="mx-auto flex min-h-[calc(100vh-9rem)] max-w-3xl flex-col space-y-4 animate-fade-up">
      <SectionHeading
        title="AI Career Coach"
        description="Ask anything about your career — your coach knows your profile and roadmap."
      />

      {!data.aiConfigured && (
        <Alert variant="info">
          AI isn&apos;t configured yet. Add a <span className="font-medium">GEMINI_API_KEY</span> to
          chat with your coach.
        </Alert>
      )}

      <div className="flex-1 space-y-3">
        {empty ? (
          <div className="rounded-2xl border border-border bg-background p-6 text-center">
            <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
              <SparklesIcon size={24} />
            </span>
            <p className="mt-3 font-medium">Your AI career coach is ready</p>
            <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
              Ask about your matches, skills to build, or what to do next. Try one of these:
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted transition-colors hover:border-primary/40 hover:text-foreground"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={index}
              className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-background text-foreground",
                )}
              >
                {message.content}
              </div>
            </div>
          ))
        )}

        {sending && (
          <div className="flex justify-start">
            <div className="inline-flex items-center gap-1.5 rounded-2xl border border-border bg-background px-4 py-3">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:150ms]" />
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary [animation-delay:300ms]" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div className="sticky bottom-4 rounded-2xl border border-border bg-background p-2 shadow-sm">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask your career coach…"
            aria-label="Message"
            rows={1}
            className="min-h-[44px] resize-none border-0 focus-visible:ring-0"
          />
          <Button
            onClick={() => send(input)}
            disabled={!input.trim() || sending}
            aria-label="Send message"
            className="shrink-0"
          >
            <ArrowRightIcon size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
