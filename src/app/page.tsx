import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/ui/logo";

export default async function Home({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      {deleted === "1" && (
        <div className="mx-auto max-w-md rounded-2xl border border-border bg-background p-4 text-sm text-foreground/80 shadow-sm">
          Your CareerVerse account has been permanently deleted. We wish you the very best for your future. 👋
        </div>
      )}
      <div className="space-y-6">
        <BrandLockup className="mx-auto max-w-xs rounded-3xl shadow-2xl shadow-primary/10 sm:max-w-sm" />
        <p className="mx-auto max-w-md text-foreground/60">
          AI-powered career development. Discover your path, build the skills, and grow with a
          personal AI mentor.
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href={ROUTES.signup}>
          <Button size="lg" className="w-full sm:w-auto">
            Get started
          </Button>
        </Link>
        <Link href={ROUTES.login}>
          <Button size="lg" variant="outline" className="w-full sm:w-auto">
            Sign in
          </Button>
        </Link>
      </div>
    </main>
  );
}
