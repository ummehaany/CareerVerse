"use client";

import type { ReactNode } from "react";

/**
 * Route transition wrapper. Next.js re-mounts this on every navigation within
 * the authenticated app, giving a consistent, subtle page-enter animation
 * across every page without touching individual routes. Purely presentational.
 */
export default function AppTemplate({ children }: { children: ReactNode }) {
  return <div className="cv-page-enter">{children}</div>;
}
