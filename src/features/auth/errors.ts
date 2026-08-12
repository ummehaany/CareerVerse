import { FirebaseError } from "firebase/app";

/** Maps Firebase Auth error codes to safe, user-friendly messages. */
const MESSAGES: Record<string, string> = {
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/user-disabled": "This account has been disabled.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Please choose a stronger password (at least 8 characters).",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/popup-blocked": "Your browser blocked the sign-in popup. Please allow popups and try again.",
  "auth/network-request-failed": "Network error. Check your connection and try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method. Try that method.",
  "auth/operation-not-allowed": "This sign-in method isn't enabled yet. Please try another.",
  "auth/credential-already-in-use": "That account is already connected to a different CareerVerse account.",
  "auth/provider-already-linked": "This provider is already connected to your account.",
  "auth/requires-recent-login": "For security, please sign out and sign in again before doing this.",
};

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof FirebaseError) {
    return MESSAGES[error.code] ?? "Something went wrong. Please try again.";
  }
  if (error instanceof Error && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}
