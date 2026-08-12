import { SparklesIcon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";

export function ChatBubble({ role, children }: { role: "ai" | "user"; children: React.ReactNode }) {
  if (role === "user") {
    return (
      <div className="flex justify-end animate-fade-up">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground">
          {children}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-3 animate-fade-up">
      <span
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
        style={{ background: "linear-gradient(135deg, var(--accent-assessment), var(--accent-mentor))" }}
        aria-hidden="true"
      >
        <SparklesIcon size={18} />
      </span>
      <div className={cn("max-w-[85%] rounded-2xl rounded-tl-sm border border-border bg-background px-4 py-3 text-[15px] leading-relaxed shadow-sm")}>
        {children}
      </div>
    </div>
  );
}

export function TypingBubble() {
  return (
    <div className="flex items-start gap-3">
      <span
        className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full text-white"
        style={{ background: "linear-gradient(135deg, var(--accent-assessment), var(--accent-mentor))" }}
        aria-hidden="true"
      >
        <SparklesIcon size={18} />
      </span>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-border bg-background px-4 py-3.5 shadow-sm" aria-label="Mentor is typing">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-foreground/40"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}
