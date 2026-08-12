"use client";

import { useState } from "react";
import { runResumeAssist, type ResumeAssistInput, type ResumeAssistResult } from "../ai-actions";
import { Button } from "@/components/ui/button";
import { SparklesIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { openUpgradeDialog } from "@/features/subscription/events";

type ButtonVariant = "primary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

/**
 * Reusable AI assistant trigger. Calls the server action and hands the result
 * back to the parent, which decides how to apply it (summary, skills, bullets…).
 */
export function AiAssistButton({
  label,
  getInput,
  onResult,
  variant = "outline",
  size = "sm",
  className,
}: {
  label: string;
  getInput: () => ResumeAssistInput;
  onResult: (result: ResumeAssistResult) => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try {
      const result = await runResumeAssist(getInput());
      if (!result.ok && result.limitReached) {
        openUpgradeDialog(result.feature);
        return;
      }
      onResult(result);
    } catch {
      onResult({ ok: false, error: "The assistant is unavailable right now. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      isLoading={loading}
      onClick={run}
      className={cn(className)}
    >
      {!loading && <SparklesIcon size={14} />}
      {label}
    </Button>
  );
}
