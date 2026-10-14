import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "PRIMARY_ADMIN")) {
    redirect("/login");
  }

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/matches", label: "Matches" },
    { href: "/admin/teams", label: "Teams" },
    { href: "/admin/players", label: "Players" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/import", label: "CSV Import" },
    { href: "/admin/ai", label: "AI" },
  ];

  if (user.role === "PRIMARY_ADMIN") {
    links.push({ href: "/admin/admins", label: "Admins" });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-slate-900">Admin Console</h1>
        <p className="text-sm text-slate-500">
          Signed in as <strong>{user.username}</strong> ({user.role})
        </p>
      </div>
      <nav className="mb-6 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            {l.label}
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
