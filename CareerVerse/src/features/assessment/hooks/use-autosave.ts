"use client";

import { useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

/**
 * Debounced autosave. Re-runs whenever `signature` changes and calls the latest
 * `onSave`. The initial mount is skipped so we don't save unchanged data.
 */
export function useAutosave(
  signature: string,
  onSave: () => Promise<void>,
  options?: { delay?: number; enabled?: boolean },
): SaveStatus {
  const { delay = 1200, enabled = true } = options ?? {};
  const [status, setStatus] = useState<SaveStatus>("idle");
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;
  const mounted = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    setStatus("saving");
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        await onSaveRef.current();
        if (!cancelled) setStatus("saved");
      } catch {
        if (!cancelled) setStatus("error");
      }
    }, delay);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [signature, enabled, delay]);

  return status;
}
