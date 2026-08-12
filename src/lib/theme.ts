/*
 * Centralized theme management for CareerVerse.
 *
 * The user's preference (light | dark | system) and accent are stored in
 * localStorage and applied to <html> via `data-theme` (resolved to light/dark)
 * and `data-accent`. globals.css keys all dark/accent tokens off those
 * attributes, so switching is a single attribute write with no duplicated CSS.
 * THEME_INIT_SCRIPT runs before first paint to prevent any flash.
 */

export const THEME_STORAGE_KEY = "cv-theme";
export const ACCENT_STORAGE_KEY = "cv-accent";

export type ThemePref = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";
export type AccentKey = "blue" | "purple" | "emerald" | "orange" | "rose" | "indigo";

export const DEFAULT_THEME: ThemePref = "system";
export const DEFAULT_ACCENT: AccentKey = "blue";

export const THEME_OPTIONS: { key: ThemePref; label: string }[] = [
  { key: "light", label: "Light" },
  { key: "dark", label: "Dark" },
  { key: "system", label: "System" },
];

/** Picker swatches (the light-mode primary for each accent). */
export const ACCENTS: { key: AccentKey; label: string; swatch: string }[] = [
  { key: "blue", label: "Blue", swatch: "#2a78d6" },
  { key: "purple", label: "Purple", swatch: "#7c3aed" },
  { key: "emerald", label: "Emerald", swatch: "#059669" },
  { key: "orange", label: "Orange", swatch: "#ea580c" },
  { key: "rose", label: "Rose", swatch: "#e11d48" },
  { key: "indigo", label: "Indigo", swatch: "#4f46e5" },
];

const THEME_VALUES: ThemePref[] = ["light", "dark", "system"];
const ACCENT_VALUES: AccentKey[] = ACCENTS.map((a) => a.key);

export function isThemePref(value: string | null): value is ThemePref {
  return value !== null && (THEME_VALUES as string[]).includes(value);
}
export function isAccentKey(value: string | null): value is AccentKey {
  return value !== null && (ACCENT_VALUES as string[]).includes(value);
}

export function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function resolveTheme(pref: ThemePref): ResolvedTheme {
  if (pref === "system") return prefersDark() ? "dark" : "light";
  return pref;
}

/** Read stored preferences (client-only). Falls back to defaults. */
export function readPreferences(): { theme: ThemePref; accent: AccentKey } {
  if (typeof window === "undefined") return { theme: DEFAULT_THEME, accent: DEFAULT_ACCENT };
  let theme: ThemePref = DEFAULT_THEME;
  let accent: AccentKey = DEFAULT_ACCENT;
  try {
    const t = window.localStorage.getItem(THEME_STORAGE_KEY);
    const a = window.localStorage.getItem(ACCENT_STORAGE_KEY);
    if (isThemePref(t)) theme = t;
    if (isAccentKey(a)) accent = a;
  } catch {
    // localStorage unavailable; use defaults
  }
  return { theme, accent };
}

/** Apply preferences to <html>, optionally with a brief cross-fade. */
export function applyTheme(pref: ThemePref, accent: AccentKey, animate = false): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (animate) {
    root.setAttribute("data-theme-transition", "");
    window.setTimeout(() => root.removeAttribute("data-theme-transition"), 340);
  }
  root.setAttribute("data-theme", resolveTheme(pref));
  root.setAttribute("data-accent", accent);
}

export function persistTheme(pref: ThemePref): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, pref);
  } catch {
    /* ignore */
  }
}
export function persistAccent(accent: AccentKey): void {
  try {
    window.localStorage.setItem(ACCENT_STORAGE_KEY, accent);
  } catch {
    /* ignore */
  }
}

/**
 * Inline script injected before paint. Reads stored prefs, resolves system, and
 * sets the attributes so the first render already matches — no flash.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}')||'${DEFAULT_THEME}';var a=localStorage.getItem('${ACCENT_STORAGE_KEY}')||'${DEFAULT_ACCENT}';var d=t==='dark'||(t==='system'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.setAttribute('data-theme',d?'dark':'light');r.setAttribute('data-accent',a);}catch(e){}})();`;
