"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Calendar, Trophy, Users, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: Home },
  { href: "/fixtures", label: "Fixtures", icon: Calendar },
  { href: "/groups", label: "Groups", icon: LayoutGrid },
  { href: "/standings", label: "Table", icon: Trophy },
  { href: "/teams", label: "Teams", icon: Users },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 bg-white md:hidden">
      <div className="flex h-16 items-center justify-around">
        {items.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 px-2 py-1 text-xs",
                active ? "text-league-primary" : "text-slate-500"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
