import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/MatchCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Knockout" };

export default async function KnockoutPage() {
  const matches = await prisma.match.findMany({
    where: {
      stage: { in: ["QUARTER_FINAL", "SEMI_FINAL", "THIRD_PLACE", "FINAL"] },
    },
    include: { homeTeam: true, awayTeam: true },
    orderBy: { kickoffAt: "asc" },
  });

  const qf = matches.filter((m) => m.stage === "QUARTER_FINAL");
  const sf = matches.filter((m) => m.stage === "SEMI_FINAL");
  const third = matches.filter((m) => m.stage === "THIRD_PLACE");
  const final = matches.filter((m) => m.stage === "FINAL");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Knockout Stage</h1>
      <p className="mb-6 text-sm text-slate-500">
        Quarter-finals, semi-finals, third-place and final. Slots resolve after group stage.
      </p>

      <Section title="Quarter-finals" matches={qf} />
      <Section title="Semi-finals" matches={sf} />
      <Section title="Third-place Match" matches={third} />
      <Section title="Final" matches={final} />
    </div>
  );
}

function Section({
  title,
  matches,
}: {
  title: string;
  matches: Awaited<ReturnType<typeof prisma.match.findMany>> &
    { homeTeam: any; awayTeam: any }[];
}) {
  if (matches.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-lg font-bold text-slate-800">{title}</h2>
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
            stage={m.stage}
            round={m.round}
          />
        ))}
      </div>
    </section>
  );
}
