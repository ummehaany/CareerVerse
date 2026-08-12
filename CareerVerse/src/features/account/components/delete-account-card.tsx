"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrashIcon } from "@/components/ui/icons-extended";
import { deleteAccountAction } from "../actions";

export function DeleteAccountCard() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const canDelete = text.trim().toUpperCase() === "DELETE";

  const handleDelete = () => {
    if (!canDelete || pending) return;
    setError(null);
    startTransition(async () => {
      const res = await deleteAccountAction(text);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      // Signed out server-side — hard navigate to the landing goodbye screen.
      window.location.href = "/?deleted=1";
    });
  };

  return (
    <Card className="space-y-4 border-danger/30">
      <div className="flex items-center gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-danger/10 text-danger">
          <TrashIcon size={16} />
        </span>
        <div>
          <h2 className="font-semibold tracking-tight text-danger">Delete Account</h2>
          <p className="text-sm text-muted">Permanently remove your account and all of your data.</p>
        </div>
      </div>

      {!open ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted">
            This permanently deletes your profile, Career Discovery, resume, roadmaps, recommendations, interviews,
            AI memory, public profile, and login. This action cannot be undone.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="shrink-0 border-danger/40 text-danger"
          >
            Delete account
          </Button>
        </div>
      ) : (
        <div className="space-y-3 rounded-xl border border-danger/30 bg-danger/[0.03] p-4">
          <p className="text-sm font-medium text-danger">This is permanent and cannot be undone.</p>
          <p className="text-xs text-muted">
            Everything tied to your account will be erased and you&apos;ll be signed out. To confirm, type{" "}
            <span className="font-mono font-semibold">DELETE</span> below.
          </p>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type DELETE"
            aria-label="Type DELETE to confirm"
            autoComplete="off"
            className="h-10 w-full max-w-xs rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-danger"
          />
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              disabled={!canDelete || pending}
              isLoading={pending}
              onClick={handleDelete}
              className="bg-danger text-white hover:opacity-90"
            >
              Permanently delete my account
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              disabled={pending}
              onClick={() => {
                setOpen(false);
                setText("");
                setError(null);
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
