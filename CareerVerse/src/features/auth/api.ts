"use client";

import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider, githubProvider } from "@/lib/firebase/client";
import type { LoginInput, SignupInput } from "./schema";

/**
 * Exchange the current user's ID token for a server session cookie.
 * Called after every successful client-side sign-in/sign-up.
 */
async function establishSession(): Promise<void> {
  const current = auth.currentUser;
  if (!current) throw new Error("No authenticated user found.");

  const idToken = await current.getIdToken(true);
  const res = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken }),
  });

  if (!res.ok) throw new Error("Could not establish a session. Please try again.");
}

export async function signInWithEmail({ email, password }: LoginInput): Promise<void> {
  await signInWithEmailAndPassword(auth, email, password);
  await establishSession();
}

export async function signUpWithEmail({ displayName, email, password }: SignupInput): Promise<void> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName });
  await sendEmailVerification(credential.user);
  await establishSession();
}

export async function signInWithGoogle(): Promise<void> {
  await signInWithPopup(auth, googleProvider);
  await establishSession();
}

export async function signInWithGithub(): Promise<void> {
  await signInWithPopup(auth, githubProvider);
  await establishSession();
}

export async function sendPasswordReset(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function resendVerification(): Promise<void> {
  if (!auth.currentUser) throw new Error("No authenticated user found.");
  await sendEmailVerification(auth.currentUser);
}

/** Reloads the user and, if their email is now verified, refreshes the session. */
export async function refreshEmailVerified(): Promise<boolean> {
  if (!auth.currentUser) return false;
  await auth.currentUser.reload();
  if (auth.currentUser.emailVerified) {
    await establishSession();
    return true;
  }
  return false;
}

export async function signOutUser(): Promise<void> {
  await fetch("/api/auth/session", { method: "DELETE" });
  await signOut(auth);
}
