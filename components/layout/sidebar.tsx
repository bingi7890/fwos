"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, PlusCircle, Target, FileText,
  Bot, Settings, Bell, LogOut, TrendingUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/data-entry", label: "Monthly Entry", icon: PlusCircle },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/ai-advisor", label: "AI Advisor", icon: Bot },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 flex flex-col border-r border-white/8 bg-[#0a0a0f]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/8">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600">
          <TrendingUp className="h-5 w-5 text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">FWOS</p>
          <p className="text-xs text-white/40">Family Wealth OS</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active
                  ? "bg-violet-600/20 text-violet-300"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/8">
        <button
          onClick={() => signOut({ callbackUrl: "/signin" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
