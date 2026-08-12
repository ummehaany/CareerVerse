"use client";

import { useState } from "react";
import { linkWithPopup, type AuthProvider } from "firebase/auth";
import { useAuth } from "@/hooks/use-auth";
import { auth, googleProvider, githubProvider } from "@/lib/firebase/client";
import { getAuthErrorMessage } from "../errors";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

interface ConnectionOption {
  key: "google.com" | "github.com";
  label: string;
  hint: string;
  provider: AuthProvider;
}

const CONNECTIONS: ConnectionOption[] = [
  { key: "google.com", label: "Google", hint: "Sign in with Google", provider: googleProvider },
  { key: "github.com", label: "GitHub", hint: "Sync your developer identity", provider: githubProvider },
];

/**
 * Lets a signed-in user link an additional sign-in provider to their
 * existing account (Firebase `linkWithPopup`), separate from the initial
 * sign-in/sign-up flow. "Connected" reflects the live Firebase Auth
 * `providerData` for the current user — the actual set of linked
 * credentials — not just whichever provider was last used to sign in.
 *
 * If a provider isn't enabled in the Firebase project (Authentication ->
 * Sign-in method), the popup will fail with `auth/operation-not-allowed`
 * and that real error is surfaced inline rather than a fabricated success.
 */
export function ConnectedAccounts() {
  const { user, loading } = useAuth();
  const [linkingKey, setLinkingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [justLinked, setJustLinked] = useState<Record<string, boolean>>({});

  const linkedProviderIds = new Set(user?.providerData.map((p) => p.providerId) ?? []);

  async function connect(option: ConnectionOption) {
    if (!auth.currentUser) return;
    setError(null);
    setLinkingKey(option.key);
    try {
      await linkWithPopup(auth.currentUser, option.provider);
      setJustLinked((prev) => ({ ...prev, [option.key]: true }));
    } catch (e) {
      setError(getAuthErrorMessage(e));
    } finally {
      setLinkingKey(null);
    }
  }

  return (
    <div>
      {error && (
        <Alert variant="error" className="mb-3">
          {error}
        </Alert>
      )}
      {CONNECTIONS.map((c) => {
        const connected = linkedProviderIds.has(c.key) || justLinked[c.key];
        return (
          <div key={c.key} className="flex items-center justify-between gap-3 border-t border-border py-3 first:border-t-0">
            <div className="min-w-0">
              <p className="text-sm font-medium">{c.label}</p>
              <p className="text-xs text-muted">{c.hint}</p>
            </div>
            {connected ? (
              <Badge variant="success">Connected</Badge>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                isLoading={linkingKey === c.key}
                disabled={loading || !user || linkingKey !== null}
                onClick={() => connect(c)}
              >
                Connect
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
