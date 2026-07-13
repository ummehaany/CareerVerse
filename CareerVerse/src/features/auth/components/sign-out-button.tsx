"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutUser } from "../api";
import { ROUTES } from "@/config/routes";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await signOutUser();
      router.replace(ROUTES.login);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" isLoading={loading} onClick={handleClick}>
      Sign out
    </Button>
  );
}
