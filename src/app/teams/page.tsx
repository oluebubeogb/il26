import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { teamInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Teams" };

export default async function TeamsPage() {
  const groups = await prisma.group.findMany({
    include: { teams: { orderBy: { name: "asc" } } },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Teams</h1>

      <div className="grid gap-8 sm:grid-cols-2">
        {groups.map((g) => (
          <section key={g.id}>
            <h2 className="mb-3 text-lg font-bold text-slate-800">
              Group {g.code}
            </h2>
            <div className="space-y-2">
              {g.teams.map((t) => (
                <Link
                  key={t.id}
                  href={`/teams/${t.slug}`}
                  className="card flex items-center gap-3 p-3 transition hover:border-league-primary/40"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                    {teamInitials(t.name, t.shortName)}
                  </span>
                  <span className="font-medium text-slate-900">{t.name}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
