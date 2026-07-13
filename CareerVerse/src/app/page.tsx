import Link from "next/link";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">CareerVerse</h1>
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
