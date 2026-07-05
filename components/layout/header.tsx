"use client";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import Link from "next/link";

export function Header({ title }: { title: string }) {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/alerts?unread=true")
      .then((r) => r.json())
      .then((d) => setUnread(d.count ?? 0))
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-white/8 bg-[#0a0a0f]/80 px-8 backdrop-blur-xl">
      <h1 className="text-lg font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-3">
        <Link href="/settings#alerts">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5 text-white/60" />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-violet-600 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
}
