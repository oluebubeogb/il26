import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatMatchDate, statusLabel, statusColor } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage() {
  const matches = await prisma.match.findMany({
    include: { homeTeam: true, awayTeam: true, group: true },
    orderBy: [{ kickoffAt: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">All Matches</h2>
      <div className="card overflow-hidden">
        <div className="table-scroll">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Match</th>
                <th className="px-3 py-2">Group / Round</th>
                <th className="px-3 py-2">Score</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {matches.map((m) => (
                <tr key={m.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    {formatMatchDate(m.kickoffAt)}
                  </td>
                  <td className="px-3 py-2.5">
                    {m.homeTeam?.name ?? m.homeSlot} vs{" "}
                    {m.awayTeam?.name ?? m.awaySlot}
                  </td>
                  <td className="px-3 py-2.5 text-slate-500">
                    {m.group?.code ? `Group ${m.group.code}` : m.round || m.stage}
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">
                    {m.fullTimeHomeScore != null
                      ? `${m.fullTimeHomeScore}–${m.fullTimeAwayScore}`
                      : "—"}
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`badge ${statusColor(m.status)}`}>
                      {statusLabel(m.status)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <Link
                      href={`/admin/matches/${m.id}`}
                      className="text-league-primary hover:underline"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
