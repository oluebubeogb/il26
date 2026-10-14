import Link from "next/link";
import type { StandingRow } from "@/lib/standings";
import { teamInitials } from "@/lib/utils";

export function StandingsTable({
  rows,
  showGroup = false,
}: {
  rows: StandingRow[];
  showGroup?: boolean;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-slate-500">
        No matches played yet. Tables will appear after results are recorded.
      </p>
    );
  }

  return (
    <div className="table-scroll">
      <table className="w-full min-w-[520px] text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <th className="px-2 py-2 font-medium">#</th>
            <th className="px-2 py-2 font-medium">Team</th>
            {showGroup && <th className="px-2 py-2 font-medium">Grp</th>}
            <th className="px-2 py-2 text-center font-medium">P</th>
            <th className="px-2 py-2 text-center font-medium">W</th>
            <th className="px-2 py-2 text-center font-medium">D</th>
            <th className="px-2 py-2 text-center font-medium">L</th>
            <th className="px-2 py-2 text-center font-medium">GF</th>
            <th className="px-2 py-2 text-center font-medium">GA</th>
            <th className="px-2 py-2 text-center font-medium">GD</th>
            <th className="px-2 py-2 text-center font-medium">Pts</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.teamId}
              className="border-b border-slate-100 hover:bg-slate-50"
            >
              <td className="px-2 py-2.5 font-medium text-slate-600">
                {r.position}
              </td>
              <td className="px-2 py-2.5">
                <Link
                  href={`/teams/${r.teamSlug}`}
                  className="flex items-center gap-2 font-medium text-slate-900 hover:text-league-primary"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600">
                    {teamInitials(r.teamName, r.shortName)}
                  </span>
                  <span className="truncate">{r.teamName}</span>
                </Link>
              </td>
              {showGroup && (
                <td className="px-2 py-2.5 text-slate-500">{r.groupCode}</td>
              )}
              <td className="px-2 py-2.5 text-center">{r.played}</td>
              <td className="px-2 py-2.5 text-center">{r.won}</td>
              <td className="px-2 py-2.5 text-center">{r.drawn}</td>
              <td className="px-2 py-2.5 text-center">{r.lost}</td>
              <td className="px-2 py-2.5 text-center">{r.goalsFor}</td>
              <td className="px-2 py-2.5 text-center">{r.goalsAgainst}</td>
              <td className="px-2 py-2.5 text-center">
                {r.goalDifference > 0 ? `+${r.goalDifference}` : r.goalDifference}
              </td>
              <td className="px-2 py-2.5 text-center font-bold text-league-primary">
                {r.points}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
