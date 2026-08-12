"use client";

import { Button } from "@/components/ui/button";
import { SparklesIcon } from "@/components/ui/icon";

/** The opening screen — introduces the AI Career Mentor and builds excitement. */
export function MentorIntro({ firstName, onBegin }: { firstName: string; onBegin: () => void }) {
  return (
    <div className="mx-auto max-w-xl animate-fade-up px-4 py-10 text-center sm:py-16">
      <div
        className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl text-white shadow-lg"
        style={{ background: "linear-gradient(135deg, var(--accent-assessment), var(--accent-mentor))" }}
      >
        <SparklesIcon size={30} />
      </div>
      <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">Hi {firstName}! 👋</h1>
      <p className="mt-3 text-lg font-semibold text-foreground/90">I&apos;m your AI Career Mentor.</p>
      <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted">
        Before I recommend careers, roadmaps, companies, and learning plans, I&apos;d love to get to know you a
        little. This isn&apos;t a test — there are no right or wrong answers. Let&apos;s just have a conversation.
      </p>
      <div className="mt-8">
        <Button size="lg" onClick={onBegin} className="px-8">
          ✨ Start the conversation
        </Button>
      </div>
    </div>
  );
}
