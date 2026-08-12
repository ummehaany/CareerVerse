import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

/** Full-width loading panel used while an async/AI action is running. */
export function LoadingPanel({
  title = "Working on it…",
  message,
}: {
  title?: string;
  message?: string;
}) {
  return (
    <Card className="flex flex-col items-center justify-center gap-4 py-16 text-center animate-fade-up">
      <Spinner className="h-8 w-8 text-primary" />
      <div className="space-y-1">
        <p className="font-medium">{title}</p>
        {message && <p className="mx-auto max-w-sm text-sm text-muted">{message}</p>}
      </div>
    </Card>
  );
}

/** Reusable empty / call-to-action state. */
export function EmptyState({
  icon,
  title,
  body,
  action,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  action?: ReactNode;
}) {
  return (
    <Card className="flex flex-col items-center gap-4 py-14 text-center animate-fade-up">
      <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 text-primary ring-1 ring-inset ring-primary/10">
        {icon}
      </span>
      <div className="space-y-1.5">
        <p className="text-base font-semibold tracking-tight">{title}</p>
        <p className="mx-auto max-w-md text-sm text-muted">{body}</p>
      </div>
      {action}
    </Card>
  );
}

/** Small consistent section heading with optional trailing action. */
export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="max-w-xl text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
