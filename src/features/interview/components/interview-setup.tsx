"use client";

import { useState } from "react";
import type { InterviewPageData } from "../queries";
import type { InterviewDifficulty, InterviewType } from "@/types/interview";
import { INTERVIEW_TYPES } from "../config";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { SparklesIcon, ChevronLeftIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export interface InterviewConfig {
  role: string;
  type: InterviewType;
  difficulty: InterviewDifficulty;
  count: number;
  perQuestionSeconds: number;
}

export function InterviewSetup({
  data,
  onStart,
  onBack,
  starting,
}: {
  data: InterviewPageData;
  onStart: (config: InterviewConfig) => void;
  onBack: () => void;
  starting: boolean;
}) {
  const [type, setType] = useState<InterviewType>("technical");
  const [role, setRole] = useState(data.careerOptions[0] ?? "");
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>("junior");
  const [count, setCount] = useState(5);
  const [perQuestionSeconds, setPerQuestionSeconds] = useState(120);

  return (
    <div className="space-y-5 animate-fade-up">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-foreground"
      >
        <ChevronLeftIcon size={16} />
        Back to dashboard
      </button>

      <div>
        <h2 className="font-semibold tracking-tight">Choose an interview type</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {INTERVIEW_TYPES.map((t) => {
            const Icon = t.icon;
            const active = type === t.value;
            const accent = `var(${t.accentVar})`;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => setType(t.value)}
                aria-pressed={active}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5",
                  active ? "border-primary bg-primary/5 ring-1 ring-primary/30" : "border-border bg-background hover:border-foreground/20",
                )}
              >
                <span
                  className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
                  style={{ color: accent, backgroundColor: `color-mix(in srgb, ${accent} 12%, transparent)` }}
                >
                  <Icon size={20} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-semibold">{t.label}</span>
                  <span className="mt-0.5 block text-xs text-muted">{t.description}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-background p-5 sm:p-6">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="role">Target role</Label>
            <Input
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Software Engineer, Data Scientist, Doctor, UI/UX Designer"
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
                      role === option ? "border-primary bg-primary/10 text-primary" : "border-border text-muted hover:border-foreground/25",
                    )}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="difficulty">Level</Label>
              <Select id="difficulty" value={difficulty} onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}>
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
            <div className="space-y-1.5">
              <Label htmlFor="time">Time per question</Label>
              <Select id="time" value={String(perQuestionSeconds)} onChange={(e) => setPerQuestionSeconds(Number(e.target.value))}>
                <option value="60">1 minute</option>
                <option value="90">1.5 minutes</option>
                <option value="120">2 minutes</option>
                <option value="180">3 minutes</option>
              </Select>
            </div>
          </div>

          {!data.aiConfigured && (
            <p className="text-xs text-subtle">
              Tip: questions and scoring work instantly using CareerVerse&apos;s built-in engine, with AI enhancement when available.
            </p>
          )}

          <Button
            size="lg"
            onClick={() => onStart({ role: role.trim(), type, difficulty, count, perQuestionSeconds })}
            disabled={!role.trim()}
            isLoading={starting}
          >
            <SparklesIcon size={18} />
            Start interview
          </Button>
        </div>
      </div>
    </div>
  );
}
