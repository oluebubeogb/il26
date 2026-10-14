import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

const nav = [
  { href: "/", label: "Home" },
  { href: "/fixtures", label: "Fixtures" },
  { href: "/results", label: "Results" },
  { href: "/groups", label: "Groups" },
  { href: "/standings", label: "Standings" },
  { href: "/knockout", label: "Knockout" },
  { href: "/teams", label: "Teams" },
];

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-league-primary">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-league-primary text-sm text-white">
            IL
          </span>
          <span className="hidden sm:inline">Ibeku League 2026</span>
          <span className="sm:hidden">Ibeku 2026</span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {(user.role === "ADMIN" || user.role === "PRIMARY_ADMIN") && (
                <Link
                  href="/admin"
                  className="rounded-lg bg-league-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-league-secondary"
                >
                  Admin
                </Link>
              )}
              <Link
                href="/account"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                {user.username}
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-league-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-league-secondary"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
