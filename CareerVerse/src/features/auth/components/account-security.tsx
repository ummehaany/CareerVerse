"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { sendPasswordReset } from "../api";
import { getAuthErrorMessage } from "../errors";

/**
 * Account security controls for Settings: change password (email/password
 * accounts receive a secure reset link) and a delete-account placeholder.
 * Purely client-side; no destructive action is performed.
 */
export function AccountSecurity({
  email,
  isEmailUser,
  providerLabel,
}: {
  email: string | null;
  isEmailUser: boolean;
  providerLabel: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function changePassword() {
    if (!email) return;
    setStatus("sending");
    setError(null);
    try {
      await sendPasswordReset(email);
      setStatus("sent");
    } catch (e) {
      setError(getAuthErrorMessage(e));
      setStatus("error");
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold tracking-tight">Change password</h3>
        {isEmailUser ? (
          <>
            <p className="text-sm text-muted">
              We&apos;ll email you a secure link to set a new password.
            </p>
            {status === "sent" && (
              <Alert variant="success">
                Password reset link sent to {email}. Check your inbox.
              </Alert>
            )}
            {status === "error" && error && <Alert variant="error">{error}</Alert>}
            <Button
              type="button"
              variant="outline"
              size="sm"
              isLoading={status === "sending"}
              onClick={changePassword}
              disabled={!email || status === "sent"}
            >
              {status === "sent" ? "Link sent" : "Send reset link"}
            </Button>
          </>
        ) : (
          <p className="text-sm text-muted">
            You sign in with {providerLabel}. Manage your password through {providerLabel}.
          </p>
        )}
      </div>

      <div className="space-y-2 border-t border-border pt-4">
        <h3 className="text-sm font-semibold tracking-tight">Delete account</h3>
        <p className="text-sm text-muted">
          Permanently remove your CareerVerse account and all associated data.
        </p>
        {confirmDelete && (
          <Alert variant="error">
            Account deletion isn&apos;t available yet — it&apos;s coming soon. To request deletion in
            the meantime, please contact support.
          </Alert>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-danger hover:bg-danger/10 hover:text-danger"
          onClick={() => setConfirmDelete(true)}
        >
          Delete account
        </Button>
      </div>
    </div>
  );
}
