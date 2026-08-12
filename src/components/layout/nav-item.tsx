"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavItem as NavItemType } from "@/config/nav";
import { cn } from "@/lib/utils";

export function NavItem({
  item,
  collapsed = false,
  onNavigate,
}: {
  item: NavItemType;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const Icon = item.icon;
  const active = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      data-tour={item.key}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={collapsed ? item.label : undefined}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        collapsed && "justify-center px-0",
        active
          ? "bg-primary/10 text-primary"
          : "text-muted hover:bg-foreground/5 hover:text-foreground",
      )}
    >
      <Icon
        size={20}
        className={cn(active ? "text-primary" : "text-subtle group-hover:text-foreground")}
      />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  );
}
