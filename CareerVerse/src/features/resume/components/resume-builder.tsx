"use client";

import { useEffect, useRef, useState } from "react";
import type { ResumePageData } from "../queries";
import type { ResumeData, ResumeTemplate } from "@/types/resume";
import { saveResume } from "../actions";
import { ResumeEditor } from "./resume-editor";
import { ResumePreview } from "./resume-preview";
import { SectionHeading } from "@/components/shared/state-panels";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { DownloadIcon } from "@/components/ui/icons-extended";
import { CheckIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const TEMPLATES: Array<{ value: ResumeTemplate; label: string }> = [
  { value: "classic", label: "Classic" },
  { value: "modern", label: "Modern" },
];

export function ResumeBuilder({ data }: { data: ResumePageData }) {
  const [resume, setResume] = useState<ResumeData>(data.resume);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const firstRun = useRef(true);

  const signature = JSON.stringify(resume);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    setStatus("saving");
    const timer = setTimeout(async () => {
      const result = await saveResume(resume);
      if (result.ok) {
        setStatus("saved");
        setError(null);
      } else {
        setStatus("error");
        setError(result.error);
      }
    }, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  function handleExport() {
    setMobileTab("preview");
    setTimeout(() => window.print(), 60);
  }

  const statusLabel =
    status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Save failed" : "";

  return (
    <div className="mx-auto max-w-6xl space-y-5 animate-fade-up">
      <SectionHeading
        title="Resume Builder"
        description="Build an ATS-friendly resume and export it to PDF. Changes save automatically."
        action={
          <div className="flex items-center gap-3">
            <span
              aria-live="polite"
              className={cn(
                "hidden items-center gap-1.5 text-xs sm:inline-flex",
                status === "error" ? "text-danger" : "text-subtle",
              )}
            >
              {status === "saved" && <CheckIcon size={13} className="text-success" />}
              {statusLabel}
            </span>
            <Button onClick={handleExport}>
              <DownloadIcon size={16} />
              Export PDF
            </Button>
          </div>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted">Template:</span>
        {TEMPLATES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => setResume((prev) => ({ ...prev, template: t.value }))}
            aria-pressed={resume.template === t.value}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
              resume.template === t.value
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted hover:bg-foreground/5",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Mobile tab switch */}
      <div className="flex rounded-lg border border-border p-1 lg:hidden">
        {(["edit", "preview"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setMobileTab(tab)}
            aria-pressed={mobileTab === tab}
            className={cn(
              "flex-1 rounded-md py-1.5 text-sm font-medium capitalize transition-colors",
              mobileTab === tab ? "bg-primary/10 text-primary" : "text-muted",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className={cn(mobileTab === "edit" ? "block" : "hidden", "lg:block")}>
          <ResumeEditor value={resume} setValue={setResume} />
        </div>
        <div className={cn(mobileTab === "preview" ? "block" : "hidden", "lg:block")}>
          <div className="lg:sticky lg:top-20">
            <ResumePreview resume={resume} />
          </div>
        </div>
      </div>
    </div>
  );
}
