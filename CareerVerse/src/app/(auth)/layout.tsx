import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/auth";
import { ROUTES } from "@/config/routes";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  // Already signed in? Skip the auth pages.
  const user = await getCurrentUser();
  if (user) redirect(ROUTES.dashboard);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href={ROUTES.home}
          className="mb-8 block text-center text-xl font-bold tracking-tight"
        >
          CareerVerse
        </Link>
        {children}
      </div>
    </div>
  );
}
