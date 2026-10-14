import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/MatchCard";
import { teamInitials } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function TeamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const team = await prisma.team.findUnique({
    where: { slug },
    include: {
      group: true,
      players: { where: { status: "active" }, orderBy: { fullName: "asc" } },
      homeMatches: {
        include: { homeTeam: true, awayTeam: true, group: true },
        orderBy: { kickoffAt: "asc" },
      },
      awayMatches: {
        include: { homeTeam: true, awayTeam: true, group: true },
        orderBy: { kickoffAt: "asc" },
      },
    },
  });

  if (!team) notFound();

  const matches = [...team.homeMatches, ...team.awayMatches].sort((a, b) => {
    const da = a.kickoffAt ? new Date(a.kickoffAt).getTime() : 0;
    const db = b.kickoffAt ? new Date(b.kickoffAt).getTime() : 0;
    return da - db;
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-8 flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-league-primary text-xl font-bold text-white">
          {teamInitials(team.name, team.shortName)}
        </span>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{team.name}</h1>
          <p className="text-sm text-slate-500">Group {team.group.code}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-bold">Squad</h2>
        {team.players.length === 0 ? (
          <p className="card p-4 text-sm text-slate-500">
            No players registered yet.
          </p>
        ) : (
          <ul className="card divide-y divide-slate-100">
            {team.players.map((p) => (
              <li key={p.id} className="flex items-center justify-between px-4 py-3">
                <span className="font-medium">{p.fullName}</span>
                <span className="text-sm text-slate-500">
                  {p.position || "—"}
                  {p.jerseyNumber != null && ` · #${p.jerseyNumber}`}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-bold">Fixtures & Results</h2>
        <div className="space-y-3">
          {matches.map((m) => (
            <MatchCard
              key={m.id}
              id={m.id}
              homeTeam={m.homeTeam}
              awayTeam={m.awayTeam}
              homeSlot={m.homeSlot}
              awaySlot={m.awaySlot}
              kickoffAt={m.kickoffAt}
              status={m.status}
              fullTimeHomeScore={m.fullTimeHomeScore}
              fullTimeAwayScore={m.fullTimeAwayScore}
              halfTimeHomeScore={m.halfTimeHomeScore}
              halfTimeAwayScore={m.halfTimeAwayScore}
              groupCode={m.group?.code}
              stage={m.stage}
              round={m.round}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
