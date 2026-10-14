import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminTeamsPage() {
  const groups = await prisma.group.findMany({
    include: { teams: { orderBy: { name: "asc" } } },
    orderBy: { displayOrder: "asc" },
  });

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Teams</h2>
      <p className="mb-4 text-sm text-slate-500">
        Teams are seeded. Group assignment is fixed for historical integrity.
      </p>
      <div className="grid gap-6 sm:grid-cols-2">
        {groups.map((g) => (
          <div key={g.id} className="card p-4">
            <h3 className="mb-2 font-semibold">Group {g.code}</h3>
            <ul className="space-y-1 text-sm">
              {g.teams.map((t) => (
                <li key={t.id} className="flex justify-between">
                  <span>{t.name}</span>
                  <span className="text-slate-400">{t.slug}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
