import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "error" | "success" | "info";

const variantStyles: Record<AlertVariant, string> = {
  error: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300",
  success: "border-green-500/30 bg-green-500/10 text-green-700 dark:text-green-300",
  info: "border-foreground/15 bg-foreground/5 text-foreground/80",
};

export function Alert({
  variant = "info",
  className,
  children,
}: {
  variant?: AlertVariant;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="alert" className={cn("rounded-md border px-3 py-2 text-sm", variantStyles[variant], className)}>
      {children}
    </div>
  );
}
