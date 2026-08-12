"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./auth-provider";

/** Composes all client-side context providers. Add future providers (theme, query) here. */
export function Providers({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
