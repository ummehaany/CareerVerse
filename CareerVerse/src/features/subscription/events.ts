/** Decoupled trigger for the global upgrade dialog (mounted once in the app shell). */
export const OPEN_UPGRADE_EVENT = "cv:open-upgrade";

export interface UpgradeEventDetail {
  feature?: string;
}

/** Open the premium upgrade dialog from anywhere (e.g. when a limit is reached). */
export function openUpgradeDialog(feature?: string): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<UpgradeEventDetail>(OPEN_UPGRADE_EVENT, { detail: { feature } }));
}
