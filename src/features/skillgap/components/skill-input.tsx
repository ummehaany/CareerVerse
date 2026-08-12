"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
  SparklesIcon,
  TargetIcon,
  LightbulbIcon,
  PuzzleIcon,
  PlusIcon,
  XIcon,
} from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import type {
  Proficiency,
  SkillGapCareer,
  UserSkillInput,
} from "../types";

/**
 * Skill Assessment input step.
 *
 * Presentational + local editing only — the parent (SkillGapView) owns the
 * canonical selectedSlug / userSkills state and passes setters down, so this
 * component stays reusable and side-effect free. Uses the shared CareerVerse
 * primitives (Card, Button, Input, Select, Label) and design tokens only.
 */

const PROFICIENCY_ORDER: Proficiency[] = ["beginner", "intermediate", "advanced"];

const PROFICIENCY_LABEL: Record<Proficiency, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

interface SkillInputProps {
  careers: SkillGapCareer[];
  selectedSlug: string | null;
  onSelectCareer: (slug: string) => void;
  userSkills: UserSkillInput[];
  onChangeSkills: (skills: UserSkillInput[]) => void;
  profileSkills: UserSkillInput[];
  onAnalyze: () => void;
}

export function SkillInput({
  careers,
  selectedSlug,
  onSelectCareer,
  userSkills,
  onChangeSkills,
  profileSkills,
  onAnalyze,
}: SkillInputProps) {
  const [draft, setDraft] = useState("");

  const selectedCareer = useMemo(
    () => careers.find((c) => c.slug === selectedSlug) ?? null,
    [careers, selectedSlug],
  );

  const existingNames = useMemo(
    () => new Set(userSkills.map((s) => s.name.trim().toLowerCase())),
    [userSkills],
  );

  function addSkill(name: string, proficiency: Proficiency = "intermediate") {
    const clean = name.trim();
    if (!clean || existingNames.has(clean.toLowerCase())) return;
    onChangeSkills([...userSkills, { name: clean, proficiency }]);
  }

  function addManySkills(names: string[]) {
    const seen = new Set(existingNames);
    const next = [...userSkills];
    for (const raw of names) {
      const clean = raw.trim();
      const key = clean.toLowerCase();
      if (!clean || seen.has(key)) continue;
      seen.add(key);
      next.push({ name: clean, proficiency: "intermediate" });
    }
    onChangeSkills(next);
  }

  function setProficiency(index: number, proficiency: Proficiency) {
    onChangeSkills(
      userSkills.map((s, i) => (i === index ? { ...s, proficiency } : s)),
    );
  }

  function removeSkill(index: number) {
    onChangeSkills(userSkills.filter((_, i) => i !== index));
  }

  function handleDraftSubmit(e: FormEvent) {
    e.preventDefault();
    addSkill(draft);
    setDraft("");
  }

  const canAnalyze = Boolean(selectedCareer) && userSkills.length > 0;
  const missingProfileSkills = profileSkills.filter(
    (s) => !existingNames.has(s.name.trim().toLowerCase()),
  );
  const missingRoleSkills = (selectedCareer?.skills ?? []).filter(
    (s) => !existingNames.has(s.trim().toLowerCase()),
  );

  return (
    <div className="animate-fade-up space-y-6">
      {/* Step 1 — target career */}
      <Card>
        <div className="flex items-start gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{
              background:
                "color-mix(in srgb, var(--accent-assessment) 12%, transparent)",
              color: "var(--accent-assessment)",
            }}
          >
            <TargetIcon size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">
              Choose your target career
            </h2>
            <p className="mt-1 text-sm text-muted">
              We&apos;ll compare your skills against what this role needs.
            </p>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="skillgap-career" className="mb-1.5 block">
            Target career
          </Label>
          <Select
            id="skillgap-career"
            value={selectedSlug ?? ""}
            onChange={(e) => onSelectCareer(e.target.value)}
          >
            <option value="" disabled>
              Select a career…
            </option>
            {careers.map((career) => (
              <option key={career.slug} value={career.slug}>
                {career.title}
                {career.category ? ` · ${career.category}` : ""}
              </option>
            ))}
          </Select>

          {selectedCareer ? (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
              <PuzzleIcon size={16} className="text-primary" />
              <span>{selectedCareer.skills.length} skills typically required</span>
            </div>
          ) : null}
        </div>
      </Card>

      {/* Step 2 — current skills */}
      <Card>
        <div className="flex items-start gap-3">
          <span
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl"
            style={{
              background:
                "color-mix(in srgb, var(--accent-roadmap) 12%, transparent)",
              color: "var(--accent-roadmap)",
            }}
          >
            <SparklesIcon size={20} />
          </span>
          <div className="min-w-0">
            <h2 className="text-base font-semibold tracking-tight">
              Add your current skills
            </h2>
            <p className="mt-1 text-sm text-muted">
              Set a proficiency level for each. Being honest makes the analysis
              more useful.
            </p>
          </div>
        </div>

        {/* quick add helpers */}
        {(missingProfileSkills.length > 0 || missingRoleSkills.length > 0) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {missingProfileSkills.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  onChangeSkills([
                    ...userSkills,
                    ...missingProfileSkills.map((s) => ({ ...s })),
                  ])
                }
              >
                <LightbulbIcon size={14} className="text-primary" />
                Use my profile skills ({missingProfileSkills.length})
              </Button>
            )}
            {missingRoleSkills.length > 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addManySkills(missingRoleSkills)}
              >
                <TargetIcon size={14} className="text-primary" />
                Add this role&apos;s skills ({missingRoleSkills.length})
              </Button>
            )}
          </div>
        )}

        {/* add-skill input */}
        <form onSubmit={handleDraftSubmit} className="mt-4 flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="e.g. Python, Communication, SQL…"
            aria-label="Add a skill"
          />
          <Button type="submit" size="md" disabled={!draft.trim()}>
            <PlusIcon size={16} />
            Add
          </Button>
        </form>

        {/* skills list */}
        {userSkills.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-subtle">
            No skills added yet. Add a few above, or use the quick-add buttons.
          </p>
        ) : (
          <ul className="mt-4 space-y-2.5">
            {userSkills.map((skill, index) => (
              <li
                key={`${skill.name}-${index}`}
                className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <span className="truncate text-sm font-medium">{skill.name}</span>
                <div className="flex items-center gap-2">
                  <div
                    className="inline-flex overflow-hidden rounded-lg border border-border"
                    role="group"
                    aria-label={`Proficiency for ${skill.name}`}
                  >
                    {PROFICIENCY_ORDER.map((level) => {
                      const active = skill.proficiency === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setProficiency(index, level)}
                          aria-pressed={active}
                          className={
                            "px-2.5 py-1.5 text-xs font-medium transition-colors " +
                            (active
                              ? "bg-foreground text-background"
                              : "text-muted hover:bg-foreground/5")
                          }
                        >
                          {PROFICIENCY_LABEL[level]}
                        </button>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    aria-label={`Remove ${skill.name}`}
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-border text-muted transition-colors hover:border-danger/40 hover:text-danger"
                  >
                    <XIcon size={15} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* analyze CTA */}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-subtle">
          {canAnalyze
            ? "Ready to see your skill gap and readiness score."
            : "Select a career and add at least one skill to continue."}
        </p>
        <Button
          type="button"
          size="lg"
          onClick={onAnalyze}
          disabled={!canAnalyze}
        >
          <SparklesIcon size={18} />
          Analyze my skill gap
        </Button>
      </div>
    </div>
  );
}
