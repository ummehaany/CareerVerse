"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "../schema";
import { signInWithEmail } from "../api";
import { getAuthErrorMessage } from "../errors";
import { GoogleButton } from "./google-button";
import { FieldError } from "./field-error";
import { OrDivider } from "./or-divider";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? ROUTES.dashboard;
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: LoginInput) {
    setFormError(null);
    try {
      await signInWithEmail(values);
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      setFormError(getAuthErrorMessage(error));
    }
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <Link href={ROUTES.forgotPassword} className="text-sm text-foreground/60 hover:text-foreground">
            Forgot password?
          </Link>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...register("password")}
        />
        <FieldError message={errors.password?.message} />
      </div>

      <Button type="submit" className="w-full" isLoading={isSubmitting}>
        Sign in
      </Button>

      <OrDivider />
      <GoogleButton redirectTo={redirectTo} onError={(m) => setFormError(m || null)} />

      <p className="text-center text-sm text-foreground/60">
        Don&apos;t have an account?{" "}
        <Link href={ROUTES.signup} className="font-medium text-foreground hover:underline">
          Sign up
        </Link>
      </p>
    </form>
  );
}
