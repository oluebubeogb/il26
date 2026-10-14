import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatMatchDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [scheduled, live, completed, nextFixtures] = await Promise.all([
    prisma.match.count({ where: { status: "SCHEDULED" } }),
    prisma.match.count({ where: { status: { in: ["LIVE", "HALF_TIME"] } } }),
    prisma.match.count({ where: { status: "FULL_TIME" } }),
    prisma.match.findMany({
      where: { status: "SCHEDULED" },
      include: { homeTeam: true, awayTeam: true, group: true },
      orderBy: { kickoffAt: "asc" },
      take: 5,
    }),
  ]);

  return (
    <div>
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Scheduled" value={scheduled} />
        <Stat label="Live / HT" value={live} />
        <Stat label="Completed" value={completed} />
        <Stat label="Total Matches" value={scheduled + live + completed} />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Next Fixtures</h2>
          <Link
            href="/admin/matches"
            className="text-sm font-medium text-league-primary hover:underline"
          >
            Manage all
          </Link>
        </div>
        <div className="card divide-y divide-slate-100">
          {nextFixtures.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">No scheduled matches.</p>
          ) : (
            nextFixtures.map((m) => (
              <Link
                key={m.id}
                href={`/admin/matches/${m.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
              >
                <span className="text-sm">
                  {m.homeTeam?.name ?? m.homeSlot} vs{" "}
                  {m.awayTeam?.name ?? m.awaySlot}
                  {m.group && (
                    <span className="ml-2 text-slate-400">
                      (Group {m.group.code})
                    </span>
                  )}
                </span>
                <span className="text-xs text-slate-400">
                  {formatMatchDate(m.kickoffAt)}
                </span>
              </Link>
            ))
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="card p-4 text-center">
      <p className="text-2xl font-bold text-league-primary">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
