import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/auth";
import { ROUTES } from "@/config/routes";
import { Logo } from "@/components/ui/logo";

export default async function AuthLayout({ children }: { children: ReactNode }) {
  // Already signed in? Skip the auth pages.
  const user = await getCurrentUser();
  if (user) redirect(ROUTES.dashboard);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link
          href={ROUTES.home}
          aria-label="CareerVerse AI home"
          className="mb-8 flex justify-center"
        >
          <Logo size={40} priority textClassName="text-xl" />
        </Link>
        {children}
      </div>
    </div>
  );
}
