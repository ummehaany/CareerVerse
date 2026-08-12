"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BellIcon, ShieldIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import {
  EMAIL_CATEGORIES,
  EMAIL_CATEGORY_META,
  normalizeEmailPreferences,
  type EmailCategory,
} from "@/lib/email/types";
import {
  PRIVACY_CATEGORIES,
  PRIVACY_CATEGORY_META,
  normalizePrivacyPreferences,
  type PrivacyCategory,
} from "@/lib/privacy/types";
import { updateEmailPreference, updatePrivacyPreference } from "@/features/settings/actions";

function Toggle({
  checked,
  onChange,
  disabled,
  label,
  description,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  label: string;
  description: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-t border-border py-3 first:border-t-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          checked ? "bg-primary" : "bg-foreground/15",
          disabled && "cursor-not-allowed opacity-60",
        )}
      >
        <span
          className={cn(
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
            checked ? "translate-x-[22px]" : "translate-x-0.5",
          )}
        />
      </button>
    </div>
  );
}

function PanelHeader({
  icon,
  title,
  description,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string | null;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">{icon}</span>
        <div>
          <h2 className="font-semibold tracking-tight">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </div>
      {badge ? <Badge variant="muted">{badge}</Badge> : null}
    </div>
  );
}

/**
 * Email notification preferences. Each togglable category persists immediately
 * via the updateEmailPreference server action (optimistic, reverts on error).
 * Critical categories are shown as "Always on".
 */
export function NotificationSettings({
  initial,
}: {
  initial?: Partial<Record<EmailCategory, boolean>>;
}) {
  const [prefs, setPrefs] = useState<Record<EmailCategory, boolean>>(() => normalizeEmailPreferences(initial));
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<EmailCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (category: EmailCategory) => (value: boolean) => {
    setError(null);
    setPrefs((p) => ({ ...p, [category]: value }));
    setBusy(category);
    startTransition(async () => {
      const res = await updateEmailPreference(category, value);
      if (!res.ok) {
        setPrefs((p) => ({ ...p, [category]: !value })); // revert
        setError(res.error);
      }
      setBusy(null);
    });
  };

  return (
    <Card className="space-y-4">
      <PanelHeader
        icon={<BellIcon size={16} />}
        title="Email notifications"
        description="Choose which high-value emails CareerVerse sends you."
      />
      <div>
        {EMAIL_CATEGORIES.map((category) => {
          const meta = EMAIL_CATEGORY_META[category];
          if (!meta.togglable) {
            return (
              <div
                key={category}
                className="flex items-start justify-between gap-4 border-t border-border py-3 first:border-t-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{meta.label}</p>
                  <p className="text-xs text-muted">{meta.description}</p>
                </div>
                <Badge variant="muted">Always on</Badge>
              </div>
            );
          }
          return (
            <Toggle
              key={category}
              checked={prefs[category]}
              onChange={handleChange(category)}
              disabled={pending && busy === category}
              label={meta.label}
              description={meta.description}
            />
          );
        })}
      </div>
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : (
        <p className="text-xs text-subtle">
          We only send meaningful, celebratory emails — never spam. Changes save automatically.
        </p>
      )}
    </Card>
  );
}

/**
 * Privacy preference toggles. Each one persists immediately via the
 * updatePrivacyPreference server action (optimistic, reverts on error) — same
 * pattern as NotificationSettings above.
 */
export function PrivacySettings({
  initial,
}: {
  initial?: Partial<Record<PrivacyCategory, boolean>>;
}) {
  const [prefs, setPrefs] = useState<Record<PrivacyCategory, boolean>>(() => normalizePrivacyPreferences(initial));
  const [pending, startTransition] = useTransition();
  const [busy, setBusy] = useState<PrivacyCategory | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (category: PrivacyCategory) => (value: boolean) => {
    setError(null);
    setPrefs((p) => ({ ...p, [category]: value }));
    setBusy(category);
    startTransition(async () => {
      const res = await updatePrivacyPreference(category, value);
      if (!res.ok) {
        setPrefs((p) => ({ ...p, [category]: !value })); // revert
        setError(res.error);
      }
      setBusy(null);
    });
  };

  return (
    <Card className="space-y-4">
      <PanelHeader icon={<ShieldIcon size={16} />} title="Privacy" description="Control what's visible and how your data is used." />
      <div>
        {PRIVACY_CATEGORIES.map((category) => {
          const meta = PRIVACY_CATEGORY_META[category];
          return (
            <Toggle
              key={category}
              checked={prefs[category]}
              onChange={handleChange(category)}
              disabled={pending && busy === category}
              label={meta.label}
              description={meta.description}
            />
          );
        })}
      </div>
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : (
        <p className="text-xs text-subtle">Changes save automatically.</p>
      )}
    </Card>
  );
}
