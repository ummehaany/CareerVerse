"use client";

import { useContext } from "react";
import { AuthContext } from "@/providers/auth-provider";

/** Access the current Firebase client auth state. */
export function useAuth() {
  return useContext(AuthContext);
}
