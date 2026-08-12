"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithGithub } from "../api";
import { getAuthErrorMessage } from "../errors";
import { Button } from "@/components/ui/button";

interface GithubButtonProps {
  redirectTo: string;
  onError: (message: string) => void;
  label?: string;
}

export function GithubButton({ redirectTo, onError, label = "Continue with GitHub" }: GithubButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    onError("");
    try {
      await signInWithGithub();
      router.replace(redirectTo);
      router.refresh();
    } catch (error) {
      onError(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button type="button" variant="outline" className="w-full" isLoading={loading} onClick={handleClick}>
      {!loading && <GithubIcon />}
      {label}
    </Button>
  );
}

function GithubIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.72-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.36.78 1.06.78 2.14 0 1.55-.01 2.8-.01 3.18 0 .31.21.68.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
    </svg>
  );
}
