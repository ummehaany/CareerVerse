"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  TargetIcon,
  RocketIcon,
  PuzzleIcon,
  ChartIcon,
  SparklesIcon,
  ClockIcon,
  RouteIcon,
  MicIcon,
  FileTextIcon,
} from "@/components/ui/icon";
import { TrashIcon, EditIcon, AwardIcon } from "@/components/ui/icons-extended";
import type { ComponentType } from "react";
import type { IconProps } from "@/components/ui/icon";
import type { MemoryDashboardData } from "../queries";
import type { MemoryEvent, MemoryEventType } from "@/lib/memory/types";
import {
  addMemoryNoteAction,
  clearAllMemoryAction,
  deleteMemoryEventAction,
  deleteMemoryNoteAction,
  generateMemoryInsightsAction,
  toggleMemoryFieldHidden,
  updateMemoryGoal,
  updateMemoryLearningStyle,
  updateMemoryTargetCompany,
} from "../actions";

const EVENT_ICON: Record<MemoryEventType, ComponentType<IconProps>> = {
  assessment: PuzzleIcon,
  resume: FileTextIcon,
  roadmap: RouteIcon,
  interview: MicIcon,
  certification: AwardIcon,
  healthScore: ChartIcon,
  recommendation: SparklesIcon,
  note: EditIcon,
  goal: TargetIcon,
};

/**
 * Pinned to "en-US" (not the runtime's default locale) so this Client
 * Component's SSR pass and browser hydration pass render identical text —
 * `undefined` locale resolves per-environment and was causing a hydration
 * mismatch here ("Aug 11, 2026" on the server vs "11 Aug 2026" in the
 * browser). Same fix pattern already used in features/timeline/queries.ts.
 */
function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "";
  }
}

function SectionHeader({ icon: Icon, title, right }: { icon: ComponentType<IconProps>; title: string; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
          <Icon size={16} />
        </span>
        <h3 className="font-semibold tracking-tight">{title}</h3>
      </div>
      {right}
    </div>
  );
}

function HideToggle({ hidden, disabled, onToggle }: { hidden: boolean; disabled?: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      className={cn(
        "rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors",
        hidden ? "border-border text-muted hover:bg-foreground/5" : "border-primary/25 bg-primary/10 text-primary hover:bg-primary/15",
        disabled && "opacity-60",
      )}
      aria-pressed={!hidden}
    >
      {hidden ? "Hidden from AI" : "Visible to AI"}
    </button>
  );
}

function Chips({ items }: { items: string[] }) {
  if (!items.length) return <p className="text-sm text-muted">Nothing here yet.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((s) => (
        <span key={s} className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium">
          {s}
        </span>
      ))}
    </div>
  );
}

export function MemoryDashboard({ data }: { data: MemoryDashboardData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const { profile } = data;

  const [insights, setInsights] = useState<string[]>(data.insights);
  const [insightSource, setInsightSource] = useState<"default" | "ai" | "offline">("default");
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalDraft, setGoalDraft] = useState(profile?.careerGoal === "Not set yet" ? "" : profile?.careerGoal ?? "");
  const [editingCompany, setEditingCompany] = useState(false);
  const [companyDraft, setCompanyDraft] = useState(profile?.targetCompanies[0] ?? "");
  const [note, setNote] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [cleared, setCleared] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!data.signedIn || !profile) return null;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) => {
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) setError(res.error ?? "Something went wrong.");
      else {
        after?.();
        router.refresh();
      }
    });
  };

  const isHidden = (field: string) => profile.hiddenFields.includes(field);

  const generateInsights = () => {
    setError(null);
    startTransition(async () => {
      const res = await generateMemoryInsightsAction();
      if (!res.ok) setError(res.error);
      else {
        setInsights(res.insights);
        setInsightSource(res.source);
      }
    });
  };

  return (
    <Card className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <SparklesIcon size={18} />
          </span>
          <div>
            <h2 className="font-semibold tracking-tight">AI Memory</h2>
            <p className="text-sm text-muted">What CareerVerse remembers to mentor you over time.</p>
          </div>
        </div>
        <Badge variant="muted">Private to you</Badge>
      </div>

      {/* AI insights */}
      <div className="rounded-2xl border border-primary/20 bg-primary/[0.05] p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold">
            <SparklesIcon size={15} className="text-primary" /> AI insights
          </p>
          <Button variant="outline" size="sm" onClick={generateInsights} disabled={pending}>
            {data.aiAvailable ? "Refresh with AI" : "Refresh"}
          </Button>
        </div>
        <ul className="space-y-1.5">
          {insights.map((ins, i) => (
            <li key={i} className="flex gap-2 text-sm text-foreground/90">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{ins}</span>
            </li>
          ))}
        </ul>
        {insightSource === "offline" && (
          <p className="mt-2 text-xs text-subtle">Generated offline — connect AI for richer insights.</p>
        )}
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      {/* Core facts */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Career goal */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <SectionHeader
            icon={TargetIcon}
            title="Career goal"
            right={<HideToggle hidden={isHidden("careerGoal")} disabled={pending} onToggle={() => run(() => toggleMemoryFieldHidden("careerGoal", !isHidden("careerGoal")))} />}
          />
          <div className="mt-3">
            {editingGoal ? (
              <div className="flex flex-col gap-2">
                <input
                  value={goalDraft}
                  onChange={(e) => setGoalDraft(e.target.value)}
                  placeholder="e.g. Data Scientist"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <Button size="sm" disabled={pending} onClick={() => run(() => updateMemoryGoal(goalDraft), () => setEditingGoal(false))}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingGoal(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{profile.careerGoal}</p>
                <button type="button" onClick={() => setEditingGoal(true)} className="text-muted transition-colors hover:text-foreground" aria-label="Edit career goal">
                  <EditIcon size={15} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dream company */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <SectionHeader
            icon={RocketIcon}
            title="Dream company"
            right={<HideToggle hidden={isHidden("targetCompanies")} disabled={pending} onToggle={() => run(() => toggleMemoryFieldHidden("targetCompanies", !isHidden("targetCompanies")))} />}
          />
          <div className="mt-3">
            {editingCompany ? (
              <div className="flex flex-col gap-2">
                <input
                  value={companyDraft}
                  onChange={(e) => setCompanyDraft(e.target.value)}
                  placeholder="e.g. Google"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <Button size="sm" disabled={pending} onClick={() => run(() => updateMemoryTargetCompany(companyDraft), () => setEditingCompany(false))}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingCompany(false)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">{profile.targetCompanies[0] ?? "Not set yet"}</p>
                <button type="button" onClick={() => setEditingCompany(true)} className="text-muted transition-colors hover:text-foreground" aria-label="Edit dream company">
                  <EditIcon size={15} />
                </button>
              </div>
            )}
            {profile.targetCompanies.length > 1 && (
              <div className="mt-2"><Chips items={profile.targetCompanies.slice(1)} /></div>
            )}
          </div>
        </div>

        {/* Learning style */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <SectionHeader
            icon={PuzzleIcon}
            title="Learning style"
            right={<HideToggle hidden={isHidden("learningStyle")} disabled={pending} onToggle={() => run(() => toggleMemoryFieldHidden("learningStyle", !isHidden("learningStyle")))} />}
          />
          <select
            value={profile.learningStyle}
            disabled={pending}
            onChange={(e) => run(() => updateMemoryLearningStyle(e.target.value))}
            className="mt-3 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          >
            {data.learningStyles.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Learning progress */}
        <div className="rounded-2xl border border-border bg-background p-4">
          <SectionHeader icon={ChartIcon} title="Learning progress" />
          <div className="mt-3 grid grid-cols-2 gap-3">
            <Stat label="Health score" value={`${profile.careerHealthScore}`} />
            <Stat label="Resume" value={`${profile.resume.completion}%`} />
            <Stat label="Roadmap" value={`${profile.roadmap.percent}%`} />
            <Stat label="Streak" value={`${profile.streak}d`} />
          </div>
        </div>
      </div>

      {/* Skills groups */}
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldCard title="Strengths" field="strongSkills" hidden={isHidden("strongSkills")} pending={pending} onToggle={run} items={profile.strongSkills} />
        <FieldCard title="Improvement areas" field="weakSkills" hidden={isHidden("weakSkills")} pending={pending} onToggle={run} items={profile.weakSkills} />
        <FieldCard title="Current skills" field="skills" hidden={isHidden("skills")} pending={pending} onToggle={run} items={profile.skills} />
        <FieldCard title="Certifications" field="certifications" hidden={isHidden("certifications")} pending={pending} onToggle={run} items={profile.certifications} />
      </div>

      {/* Timeline */}
      <div className="rounded-2xl border border-border bg-background p-4">
        <SectionHeader icon={ClockIcon} title="Recent milestones" />
        {data.timeline.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Your career events will appear here as you make progress.</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {data.timeline.map((ev) => (
              <TimelineRow key={ev.id} ev={ev} pending={pending} onDelete={() => run(() => deleteMemoryEventAction(ev.id))} />
            ))}
          </ul>
        )}
      </div>

      {/* Notes */}
      <div className="rounded-2xl border border-border bg-background p-4">
        <SectionHeader icon={EditIcon} title="Things to remember" />
        <div className="mt-3 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note for your AI mentor to remember…"
            className="h-10 flex-1 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-primary"
          />
          <Button size="sm" disabled={pending || !note.trim()} onClick={() => run(() => addMemoryNoteAction(note), () => setNote(""))}>Add</Button>
        </div>
        {profile.notes.length > 0 && (
          <ul className="mt-3 space-y-2">
            {profile.notes.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2">
                <span className="text-sm">{n.text}</span>
                <button type="button" onClick={() => run(() => deleteMemoryNoteAction(n.id))} disabled={pending} className="shrink-0 text-muted transition-colors hover:text-danger" aria-label="Delete note">
                  <TrashIcon size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Danger zone */}
      <div className="rounded-2xl border border-danger/30 bg-danger/[0.03] p-4">
        {cleared ? (
          <div>
            <p className="text-sm font-semibold text-success">Your CareerVerse profile has been reset.</p>
            <p className="mt-1 text-xs text-muted">All personalized data is cleared. Ready for a fresh start?</p>
            <Link href={ROUTES.assessment} className="mt-3 inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground">
              ✨ Start Career Discovery
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-danger">Clear all memory &amp; reset profile</p>
              <p className="text-xs text-muted">
                Permanently clears everything personalized — Career Discovery, memory, recommendations, roadmap, resume analysis,
                interviews, scores, goals, and companies. Your account, plan, and login stay. This can&apos;t be undone.
              </p>
            </div>
            {confirmClear ? (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setConfirmClear(false)}>Cancel</Button>
                <Button
                  size="sm"
                  disabled={pending}
                  onClick={() => run(() => clearAllMemoryAction(), () => { setConfirmClear(false); setCleared(true); })}
                  className="border-danger/40 text-danger"
                >
                  Confirm reset
                </Button>
              </div>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setConfirmClear(true)} className="border-danger/40 text-danger">Clear &amp; reset</Button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-foreground/[0.02] p-3">
      <p className="text-lg font-bold tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  );
}

function FieldCard({
  title,
  field,
  hidden,
  items,
  pending,
  onToggle,
}: {
  title: string;
  field: string;
  hidden: boolean;
  items: string[];
  pending: boolean;
  onToggle: (fn: () => Promise<{ ok: boolean; error?: string }>) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <SectionHeader
        icon={AwardIcon}
        title={title}
        right={<HideToggle hidden={hidden} disabled={pending} onToggle={() => onToggle(() => toggleMemoryFieldHidden(field, !hidden))} />}
      />
      <div className="mt-3">
        <Chips items={items} />
      </div>
    </div>
  );
}

function TimelineRow({ ev, pending, onDelete }: { ev: MemoryEvent; pending: boolean; onDelete: () => void }) {
  const Icon = EVENT_ICON[ev.type] ?? SparklesIcon;
  return (
    <li className="flex items-start gap-3">
      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-foreground/[0.05] text-foreground/70">
        <Icon size={14} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{ev.title}</p>
        {ev.detail && <p className="text-xs text-muted">{ev.detail}</p>}
        <p className="text-[11px] text-subtle">{fmtDate(ev.at)}</p>
      </div>
      {ev.source === "stored" && (
        <button type="button" onClick={onDelete} disabled={pending} className="shrink-0 text-muted transition-colors hover:text-danger" aria-label="Delete event">
          <TrashIcon size={14} />
        </button>
      )}
    </li>
  );
}
