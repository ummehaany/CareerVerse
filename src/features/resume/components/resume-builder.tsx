"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ResumePageData } from "../queries";
import type { ResumeData, ResumeTemplate } from "@/types/resume";
import { saveResume } from "../actions";
import { TEMPLATES, RESUME_SECTIONS } from "../defaults";
import { ResumeEditor } from "./resume-editor";
import { ResumePreview } from "./resume-preview";
import { AtsPanel } from "./ats-panel";
import { SectionArranger } from "./section-arranger";
import { SectionHeading } from "@/components/shared/state-panels";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { DownloadIcon } from "@/components/ui/icons-extended";
import { CheckIcon, PlusIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

type SaveStatus = "idle" | "saving" | "saved" | "error";

const ZOOM_MIN = 0.7;
const ZOOM_MAX = 1.3;
const ZOOM_STEP = 0.1;

function sectionFilled(resume: ResumeData, key: string): boolean {
  switch (key) {
    case "summary":
      return resume.summary.trim().length > 0;
    case "skills":
      return resume.skills.length > 0;
    case "achievements":
      return resume.achievements.length > 0;
    case "interests":
      return resume.interests.length > 0;
    default: {
      const v = (resume as unknown as Record<string, unknown[]>)[key];
      return Array.isArray(v) && v.length > 0;
    }
  }
}

export function ResumeBuilder({ data }: { data: ResumePageData }) {
  const [resume, setResume] = useState<ResumeData>(data.resume);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<"edit" | "preview">("edit");
  const [zoom, setZoom] = useState(1);
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

  async function saveNow() {
    setStatus("saving");
    const result = await saveResume(resume);
    if (result.ok) {
      setStatus("saved");
      setError(null);
    } else {
      setStatus("error");
      setError(result.error);
    }
  }

  function handlePrint() {
    setMobileTab("preview");
    setTimeout(() => window.print(), 80);
  }

  const filledCount = useMemo(
    () => RESUME_SECTIONS.filter((s) => sectionFilled(resume, s.key)).length,
    [resume],
  );
  const progressPct = Math.round((filledCount / RESUME_SECTIONS.length) * 100);

  const gaps = useMemo(() => {
    const g: string[] = [];
    if (!resume.contact.fullName.trim()) g.push("your full name");
    if (!resume.contact.email.trim()) g.push("an email");
    if (resume.experience.length === 0) g.push("at least one experience");
    if (resume.skills.length === 0) g.push("a few skills");
    return g;
  }, [resume]);

  const statusLabel =
    status === "saving" ? "Saving…" : status === "saved" ? "Saved" : status === "error" ? "Save failed" : "";

  const zoomStyle = { "--rb-zoom": zoom } as unknown as React.CSSProperties;

  return (
    <div className="mx-auto max-w-6xl space-y-5 animate-fade-up">
      <SectionHeading
        title="Resume Builder"
        description="Build an AI-assisted, ATS-friendly resume. Changes save automatically."
        action={
          <div className="flex items-center gap-2">
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
            <Button variant="outline" size="sm" onClick={saveNow} isLoading={status === "saving"}>
              Save draft
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              Print
            </Button>
            <Button size="sm" onClick={handlePrint}>
              <DownloadIcon size={16} />
              Export PDF
            </Button>
          </div>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}
      {gaps.length > 0 && (
        <Alert variant="info">Add {gaps.join(", ")} to complete your resume.</Alert>
      )}

      {/* Templates + section progress */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted">Template:</span>
          {TEMPLATES.map((t) => (
            <button
              key={t.value}
              type="button"
              title={t.hint}
              onClick={() => setResume((prev) => ({ ...prev, template: t.value as ResumeTemplate }))}
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
        <div className="min-w-[160px] space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted">Sections completed</span>
            <span className="font-medium tabular-nums">
              {filledCount}/{RESUME_SECTIONS.length}
            </span>
          </div>
          <Progress value={progressPct} label="Resume completeness" />
        </div>
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
        {/* Editor */}
        <div className={cn(mobileTab === "edit" ? "block" : "hidden", "lg:block")}>
          <ResumeEditor value={resume} setValue={setResume} />
        </div>

        {/* Score + preview + arrange */}
        <div className={cn(mobileTab === "preview" ? "block" : "hidden", "lg:block")}>
          <div className="space-y-4 lg:sticky lg:top-20">
            <AtsPanel resume={resume} />

            <div className="rounded-2xl border border-border bg-background p-3">
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-sm font-semibold tracking-tight">Live preview</h2>
                <div className="inline-flex items-center gap-1 rounded-md border border-border p-0.5">
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 10) / 10))}
                    aria-label="Zoom out"
                    className="rounded p-1 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
                  >
                    <span className="grid h-4 w-4 place-items-center text-base leading-none">−</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom(1)}
                    className="min-w-11 rounded px-1 text-center text-xs font-medium tabular-nums text-muted transition-colors hover:text-foreground"
                  >
                    {Math.round(zoom * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 10) / 10))}
                    aria-label="Zoom in"
                    className="rounded p-1 text-muted transition-colors hover:bg-foreground/5 hover:text-foreground"
                  >
                    <PlusIcon size={15} />
                  </button>
                </div>
              </div>
              <div className="max-h-[70vh] overflow-auto rounded-lg bg-foreground/[0.02] p-2">
                <div className="rb-zoom transition-transform" style={zoomStyle}>
                  <ResumePreview resume={resume} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-4">
              <h2 className="mb-1 text-sm font-semibold tracking-tight">Arrange sections</h2>
              <p className="mb-3 text-xs text-subtle">Drag, or use the arrows, to reorder how sections appear.</p>
              <SectionArranger
                order={resume.sectionOrder}
                onReorder={(next) => setResume((prev) => ({ ...prev, sectionOrder: next }))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
