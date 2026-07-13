import Link from "next/link";
import { QUICK_ACTIONS } from "../config";

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {QUICK_ACTIONS.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.key}
            href={action.href}
            className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-background p-4 text-center transition-colors hover:border-primary/40 hover:bg-primary/5"
          >
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-105">
              <Icon size={20} />
            </span>
            <span className="text-xs font-medium sm:text-sm">{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
