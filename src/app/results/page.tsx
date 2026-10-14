import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/MatchCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Results" };

export default async function ResultsPage() {
  const matches = await prisma.match.findMany({
    where: { status: "FULL_TIME" },
    include: { homeTeam: true, awayTeam: true, group: true },
    orderBy: { kickoffAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Results</h1>
      <p className="mb-6 text-sm text-slate-500">Completed matches</p>

      {matches.length === 0 ? (
        <p className="card p-8 text-center text-slate-500">
          No results recorded yet. Results will appear here after matches are completed.
        </p>
      ) : (
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
      )}
    </div>
  );
}
