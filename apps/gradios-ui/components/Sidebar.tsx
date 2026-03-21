"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants";
import { UserMenu } from "./UserMenu";
import {
  LayoutDashboard,
  Bot,
  FileText,
  Bell,
  Zap,
  FolderKanban,
  Activity,
  CalendarDays,
} from "lucide-react";

const ICONS: Record<string, React.ElementType> = {
  LayoutDashboard,
  Bot,
  FileText,
  Bell,
  FolderKanban,
  Activity,
  CalendarDays,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex w-16 flex-col items-center py-4 gap-1 border-r border-zinc-800/80 bg-zinc-900/60">
      {/* Logo */}
      <Link
        href="/"
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4"
      >
        <Zap className="w-5 h-5 text-white" />
      </Link>

      {/* Nav items */}
      {NAV_ITEMS.map((item) => {
        const Icon = ICONS[item.icon] ?? LayoutDashboard;
        const active =
          item.href === "/"
            ? pathname === "/"
            : pathname.startsWith(item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            title={item.label}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
              active
                ? "bg-indigo-600 text-white"
                : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/60"
            }`}
          >
            <Icon className="w-5 h-5" />
          </Link>
        );
      })}

      {/* Spacer */}
      <div className="flex-1" />

      {/* User menu at bottom */}
      <UserMenu />
    </aside>
  );
}
