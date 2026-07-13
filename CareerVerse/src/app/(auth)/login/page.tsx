import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome back</CardTitle>
        <CardDescription>Sign in to continue to CareerVerse.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Suspense boundary required because LoginForm reads useSearchParams. */}
        <Suspense>
          <LoginForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
