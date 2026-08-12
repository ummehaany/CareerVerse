"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, type ForgotPasswordInput } from "../schema";
import { sendPasswordReset } from "../api";
import { getAuthErrorMessage } from "../errors";
import { FieldError } from "./field-error";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({ resolver: zodResolver(forgotPasswordSchema) });

  async function onSubmit(values: ForgotPasswordInput) {
    setFormError(null);
    try {
      await sendPasswordReset(values.email);
      setSent(true);
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
  }

  if (sent) {
    return (
      <div className="space-y-4">
        <Alert variant="success">
          If an account exists for that email, we&apos;ve sent a password reset link. Check your inbox.
        </Alert>
        <Link href={ROUTES.login} className="block text-center text-sm font-medium text-foreground hover:underline">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {formError && <Alert variant="error">{formError}</Alert>}

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          {...register("email")}
        />
        <FieldError message={errors.email?.message} />
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Send reset link
      </Button>

      <Link href={ROUTES.login} className="block text-center text-sm text-foreground/60 hover:text-foreground">
        Back to sign in
      </Link>
    </form>
  );
}
