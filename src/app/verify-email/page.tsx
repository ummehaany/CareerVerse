import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/firebase/auth";
import { ROUTES } from "@/config/routes";
import { VerifyEmailView } from "@/features/auth/components/verify-email-view";

export const metadata: Metadata = { title: "Verify your email" };

// Lives outside the (auth) group because it is shown to authenticated—but
// unverified—users, who would otherwise be redirected away by the (auth) layout.
export default async function VerifyEmailPage() {
  const user = await getCurrentUser();
  if (!user) redirect(ROUTES.login);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <Link href={ROUTES.home} className="mb-8 block text-center text-xl font-bold tracking-tight">
          CareerVerse
        </Link>
        <VerifyEmailView email={user.email} />
      </div>
    </div>
  );
}
