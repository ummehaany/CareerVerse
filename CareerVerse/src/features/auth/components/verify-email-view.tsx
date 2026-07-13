"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { refreshEmailVerified, resendVerification, signOutUser } from "../api";
import { getAuthErrorMessage } from "../errors";
import { ROUTES } from "@/config/routes";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type Status = { type: "error" | "success"; message: string } | null;

export function VerifyEmailView({ email }: { email: string | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(null);
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);

  async function handleCheck() {
    setChecking(true);
    setStatus(null);
    try {
      const verified = await refreshEmailVerified();
      if (verified) {
        router.replace(ROUTES.dashboard);
        router.refresh();
      } else {
        setStatus({
          type: "error",
          message: "Your email isn't verified yet. Click the link in the email, then try again.",
        });
      }
    } catch (error) {
      setStatus({ type: "error", message: getAuthErrorMessage(error) });
    } finally {
      setChecking(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setStatus(null);
    try {
      await resendVerification();
      setStatus({ type: "success", message: "Verification email sent. Check your inbox." });
    } catch (error) {
      setStatus({ type: "error", message: getAuthErrorMessage(error) });
    } finally {
      setResending(false);
    }
  }

  async function handleSignOut() {
    await signOutUser();
    router.replace(ROUTES.login);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          We sent a verification link to {email ?? "your email address"}. Confirm it to continue.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {status && <Alert variant={status.type}>{status.message}</Alert>}
        <Button className="w-full" isLoading={checking} onClick={handleCheck}>
          I&apos;ve verified my email
        </Button>
        <Button className="w-full" variant="outline" isLoading={resending} onClick={handleResend}>
          Resend verification email
        </Button>
      </CardContent>
      <CardFooter>
        <button
          type="button"
          onClick={handleSignOut}
          className="mx-auto text-sm text-foreground/60 hover:text-foreground"
        >
          Sign out
        </button>
      </CardFooter>
    </Card>
  );
}
