"use client";

import { useMemo, useState } from "react";
import type { ResumeData } from "@/types/resume";
import { computeAtsScore } from "../ats";
import { AiAssistButton } from "./ai-assist-button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircleIcon } from "@/components/ui/icon";

function ScoreRing({ value }: { value: number }) {
  const size = 68;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;
  const color =
    value >= 80 ? "var(--success)" : value >= 60 ? "var(--primary)" : value >= 40 ? "var(--warning)" : "var(--danger)";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-foreground/10" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 700ms ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-lg font-bold leading-none tabular-nums">{value}</span>
        <span className="text-[9px] uppercase tracking-wide text-subtle">/ 100</span>
      </div>
    </div>
  );
}

export function AtsPanel({ resume }: { resume: ResumeData }) {
  const result = useMemo(() => computeAtsScore(resume), [resume]);
  const [aiTips, setAiTips] = useState<string[] | null>(null);
  const [aiSource, setAiSource] = useState<"ai" | "offline" | null>(null);

  const label = result.score >= 80 ? "Excellent" : result.score >= 60 ? "Good" : result.score >= 40 ? "Fair" : "Needs work";

  return (
    <section className="rounded-2xl border border-border bg-background p-4 sm:p-5">
      <div className="flex items-center gap-4">
        <ScoreRing value={result.score} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="font-semibold tracking-tight">ATS Score</h2>
            <Badge variant={result.score >= 60 ? "success" : result.score >= 40 ? "warning" : "muted"}>{label}</Badge>
          </div>
          <p className="mt-0.5 text-sm text-muted">How well applicant-tracking systems will parse and rank this resume.</p>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {result.dimensions.map((d) => (
          <div key={d.key} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">{d.label}</span>
              <span className="font-medium tabular-nums">{d.score}%</span>
            </div>
            <Progress value={d.score} />
          </div>
        ))}
      </div>

      {(aiTips ?? result.suggestions).length > 0 && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold">
              {aiTips ? "AI recommendations" : "Suggestions to improve"}
              {aiSource === "offline" && <span className="ml-1.5 text-xs font-normal text-subtle">(offline)</span>}
            </p>
            <AiAssistButton
              label="AI tips"
              getInput={() => ({ task: "ats", resume })}
              onResult={(r) => {
                if (r.ok && r.kind === "list") {
                  setAiTips(r.items);
                  setAiSource(r.source);
                }
              }}
            />
          </div>
          <ul className="space-y-1.5">
            {(aiTips ?? result.suggestions).slice(0, 8).map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-muted">
                <CheckCircleIcon size={15} className="mt-0.5 shrink-0 text-primary" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
