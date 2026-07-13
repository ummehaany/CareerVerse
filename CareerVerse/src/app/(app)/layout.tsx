import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/auth";
import { ROUTES } from "@/config/routes";
import { AppShell } from "@/components/layout/app-shell";
import type { SessionUser } from "@/types/session";

// Authoritative auth gate for the application. Verifies the session server-side,
// loads the current user once, and renders the shell (sidebar + topbar) around
// every authenticated page.
export default async function AppLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  const sessionUser: SessionUser = {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    role: user.role,
    plan: user.plan,
  };

  return <AppShell user={sessionUser}>{children}</AppShell>;
}
