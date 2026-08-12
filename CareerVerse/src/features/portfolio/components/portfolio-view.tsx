"use client";

import { useState, useTransition } from "react";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { SparklesIcon, CheckIcon, UserIcon, GlobeIcon } from "@/components/ui/icon";
import type { Portfolio } from "@/types/portfolio";
import { savePortfolioAction } from "../actions";
import type { PortfolioPageData } from "../types";
import { PortfolioEditor } from "./portfolio-editor";
import { PortfolioPreview } from "./portfolio-preview";
import { ProgressOverview } from "./progress-overview";

type Tab = "edit" | "preview";

/**
 * Client orchestrator for the Smart Profile & Career Portfolio.
 *
 * Owns the editable portfolio state, toggles between the editor and the clean
 * shareable portfolio view, and persists via the server action. Progress
 * signals are read-only and passed straight through from the server query.
 */
export function PortfolioView({ data }: { data: PortfolioPageData }) {
  const [tab, setTab] = useState<Tab>("edit");
  const [portfolio, setPortfolio] = useState<Portfolio>(data.portfolio);
  const [dirty, setDirty] = useState(data.isNew);
  const [saveState, setSaveState] = useState<"idle" | "saved" | "error">("idle");
  const [isSaving, startSaving] = useTransition();

  function update(next: Portfolio) {
    setPortfolio(next);
    setDirty(true);
    setSaveState("idle");
  }

  function handleSave() {
    startSaving(async () => {
      const res = await savePortfolioAction(portfolio);
      if (res.ok) {
        setSaveState("saved");
        setDirty(false);
      } else {
        setSaveState("error");
      }
    });
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 animate-fade-up">
      <PageHeader
        title="Smart Profile & Portfolio"
        description="Your professional career identity — edit it here, then share the polished view."
        actions={
          <Button type="button" onClick={handleSave} isLoading={isSaving} disabled={isSaving || !dirty}>
            {saveState === "saved" && !dirty ? (
              <>
                <CheckIcon size={16} />
                Saved
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        }
      />

      {data.isNew && (
        <div className="flex items-start gap-2 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 text-sm text-foreground/80">
          <SparklesIcon size={16} className="mt-0.5 shrink-0 text-primary" />
          <p>
            We&apos;ve pre-filled your portfolio from your assessment and resume. Review the details,
            add your projects and achievements, then hit <span className="font-medium">Save changes</span>.
          </p>
        </div>
      )}

      {saveState === "error" && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
          Couldn&apos;t save your portfolio. Please try again in a moment.
        </p>
      )}

      {/* Tab switcher */}
      <div className="inline-flex rounded-lg border border-border bg-surface p-1">
        {(
          [
            { key: "edit", label: "Edit", icon: UserIcon },
            { key: "preview", label: "Portfolio view", icon: GlobeIcon },
          ] as const
        ).map(({ key, label, icon: Icon }) => {
          const active = tab === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-pressed={active}
              className={
                "inline-flex items-center gap-1.5 rounded-md px-3.5 py-1.5 text-sm font-medium transition-colors " +
                (active ? "bg-foreground text-background" : "text-muted hover:text-foreground")
              }
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </div>

      {tab === "edit" ? (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0">
            <PortfolioEditor value={portfolio} onChange={update} />
          </div>
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <ProgressOverview progress={data.progress} />
          </aside>
        </div>
      ) : (
        <PortfolioPreview portfolio={portfolio} progress={data.progress} />
      )}
    </div>
  );
}
