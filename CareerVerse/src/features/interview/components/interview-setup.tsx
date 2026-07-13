"use client";

import { useState } from "react";
import type { InterviewPageData, RecentInterview } from "../queries";
import type { InterviewDifficulty } from "@/types/interview";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { MicIcon, SparklesIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

function RecentRow({ item }: { item: RecentInterview }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3.5 py-2.5">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{item.role}</p>
        <p className="text-xs capitalize text-subtle">
          {item.difficulty} · {item.questionCount} questions
        </p>
      </div>
      {item.overallScore !== null && (
        <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary tabular-nums">
          {item.overallScore}/100
        </span>
      )}
    </div>
  );
}

export function InterviewSetup({
  data,
  onStart,
  starting,
}: {
  data: InterviewPageData;
  onStart: (role: string, difficulty: InterviewDifficulty, count: number) => void;
  starting: boolean;
}) {
  const [role, setRole] = useState(data.careerOptions[0] ?? "");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("mid");
  const [count, setCount] = useState(5);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <MicIcon size={22} />
          </span>
          <div>
            <h2 className="font-semibold tracking-tight">Start a mock interview</h2>
            <p className="mt-0.5 text-sm text-muted">
              Practice role-specific questions and get AI scoring and feedback.
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="role">Target role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Frontend Engineer"
            />
            {data.careerOptions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {data.careerOptions.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setRole(option)}
                    className={cn(
                      "rounded-full border px-2.5 py-1 text-xs transition-colors",
                      role === option
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted hover:border-foreground/25",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="difficulty">Level</Label>
              <Select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}
              >
                <option value="junior">Junior / entry-level</option>
                <option value="mid">Mid-level</option>
                <option value="senior">Senior</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="count">Questions</Label>
              <Select id="count" value={String(count)} onChange={(e) => setCount(Number(e.target.value))}>
                <option value="3">3 questions</option>
                <option value="5">5 questions</option>
                <option value="8">8 questions</option>
              </Select>
            </div>
          </div>

          {!data.aiConfigured && (
            <p className="text-xs text-subtle">
              Note: AI isn&apos;t configured yet — add a GEMINI_API_KEY to enable interviews.
            </p>
          )}

          <Button size="lg" onClick={() => onStart(role.trim(), difficulty, count)} disabled={!role.trim()} isLoading={starting}>
            <SparklesIcon size={18} />
            Start interview
          </Button>
        </div>
      </div>

      {data.recent.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-subtle">Recent sessions</h2>
          <div className="space-y-2">
            {data.recent.map((item) => (
              <RecentRow key={item.id} item={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
