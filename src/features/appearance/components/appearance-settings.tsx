"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { PaletteIcon, CheckIcon } from "@/components/ui/icon";
import {
  ACCENTS,
  DEFAULT_ACCENT,
  DEFAULT_THEME,
  THEME_OPTIONS,
  applyTheme,
  persistAccent,
  persistTheme,
  readPreferences,
  type AccentKey,
  type ThemePref,
} from "@/lib/theme";

function ThemeSwatch({ theme }: { theme: ThemePref }) {
  if (theme === "light") {
    return (
      <span className="flex h-full w-full flex-col gap-1 bg-white p-2">
        <span className="h-1.5 w-8 rounded-full bg-neutral-800" />
        <span className="h-1.5 w-12 rounded-full bg-neutral-300" />
        <span className="mt-auto h-3 w-10 rounded bg-[#2a78d6]" />
      </span>
    );
  }
  if (theme === "dark") {
    return (
      <span className="flex h-full w-full flex-col gap-1 bg-[#141414] p-2">
        <span className="h-1.5 w-8 rounded-full bg-neutral-200" />
        <span className="h-1.5 w-12 rounded-full bg-neutral-600" />
        <span className="mt-auto h-3 w-10 rounded bg-[#3987e5]" />
      </span>
    );
  }
  // system — split light/dark
  return (
    <span className="grid h-full w-full grid-cols-2">
      <span className="flex flex-col gap-1 bg-white p-2">
        <span className="h-1.5 w-6 rounded-full bg-neutral-800" />
        <span className="mt-auto h-2.5 w-6 rounded bg-[#2a78d6]" />
      </span>
      <span className="flex flex-col gap-1 bg-[#141414] p-2">
        <span className="h-1.5 w-6 rounded-full bg-neutral-200" />
        <span className="mt-auto h-2.5 w-6 rounded bg-[#3987e5]" />
      </span>
    </span>
  );
}

export function AppearanceSettings() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemePref>(DEFAULT_THEME);
  const [accent, setAccent] = useState<AccentKey>(DEFAULT_ACCENT);

  useEffect(() => {
    const prefs = readPreferences();
    setTheme(prefs.theme);
    setAccent(prefs.accent);
    setMounted(true);
  }, []);

  // Keep "System" responsive to OS changes.
  useEffect(() => {
    if (!mounted || theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system", accent, true);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mounted, theme, accent]);

  function chooseTheme(next: ThemePref) {
    setTheme(next);
    persistTheme(next);
    applyTheme(next, accent, true);
  }

  function chooseAccent(next: AccentKey) {
    setAccent(next);
    persistAccent(next);
    applyTheme(theme, next, true);
  }

  function reset() {
    setTheme(DEFAULT_THEME);
    setAccent(DEFAULT_ACCENT);
    persistTheme(DEFAULT_THEME);
    persistAccent(DEFAULT_ACCENT);
    applyTheme(DEFAULT_THEME, DEFAULT_ACCENT, true);
  }

  const isDefault = mounted && theme === DEFAULT_THEME && accent === DEFAULT_ACCENT;

  return (
    <Card className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
            <PaletteIcon size={16} />
          </span>
          <div>
            <h2 className="font-semibold tracking-tight">Appearance</h2>
            <p className="text-sm text-muted">Personalize your theme and accent color.</p>
          </div>
        </div>
        <Button type="button" variant="ghost" size="sm" onClick={reset} disabled={isDefault}>
          Reset to default
        </Button>
      </div>

      {/* Theme mode */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Theme</p>
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map((opt) => {
            const active = mounted && theme === opt.key;
            return (
              <button
                key={opt.key}
                type="button"
                onClick={() => chooseTheme(opt.key)}
                aria-pressed={active}
                className={
                  "overflow-hidden rounded-xl border text-left transition-all " +
                  (active ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-foreground/25")
                }
              >
                <span className="block h-16 w-full overflow-hidden">
                  <ThemeSwatch theme={opt.key} />
                </span>
                <span className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium">{opt.label}</span>
                  {active && <CheckIcon size={14} className="text-primary" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accent color */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Accent color</p>
        <div className="flex flex-wrap gap-3">
          {ACCENTS.map((a) => {
            const active = mounted && accent === a.key;
            return (
              <button
                key={a.key}
                type="button"
                onClick={() => chooseAccent(a.key)}
                aria-label={a.label}
                aria-pressed={active}
                title={a.label}
                className={
                  "grid h-9 w-9 place-items-center rounded-full transition-transform hover:scale-105 " +
                  (active ? "ring-2 ring-offset-2 ring-offset-[var(--background)]" : "")
                }
                style={{ background: a.swatch, boxShadow: active ? `0 0 0 2px ${a.swatch}` : undefined }}
              >
                {active && <CheckIcon size={16} className="text-white" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live preview */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-subtle">Live preview</p>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="rounded-lg border border-border bg-background p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold tracking-tight">Sample card</h3>
              <Badge variant="primary">Accent</Badge>
            </div>
            <p className="mt-1 text-sm text-muted">
              This preview updates instantly as you change the theme and accent.
            </p>
            <div className="mt-3">
              <Progress value={68} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button type="button" size="sm">
                Primary
              </Button>
              <Button type="button" variant="outline" size="sm">
                Outline
              </Button>
              <Input placeholder="Input field" className="h-9 max-w-[160px]" />
            </div>
          </div>
        </div>
        <p className="text-xs text-subtle">Your preference is saved automatically and restored on every visit.</p>
      </div>
    </Card>
  );
}
