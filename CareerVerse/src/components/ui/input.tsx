import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  function Input({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-10 w-full rounded-md border border-foreground/15 bg-transparent px-3 py-2 text-sm placeholder:text-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-500/60",
          className,
        )}
        {...props}
      />
    );
  },
);
