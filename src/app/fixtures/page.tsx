import { prisma } from "@/lib/prisma";
import { MatchCard } from "@/components/MatchCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Fixtures" };

export default async function FixturesPage({
  searchParams,
}: {
  searchParams: Promise<{ group?: string; status?: string }>;
}) {
  const params = await searchParams;
  const where: Record<string, unknown> = {
    status: { notIn: ["FULL_TIME", "CANCELLED"] },
  };

  if (params.group) {
    const group = await prisma.group.findUnique({ where: { code: params.group } });
    if (group) where.groupId = group.id;
  }
  if (params.status) where.status = params.status;

  const matches = await prisma.match.findMany({
    where,
    include: { homeTeam: true, awayTeam: true, group: true },
    orderBy: [{ kickoffAt: "asc" }, { createdAt: "asc" }],
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Fixtures</h1>
      <p className="mb-6 text-sm text-slate-500">
        All upcoming and live matches. Kick-off times shown in Africa/Lagos.
      </p>

      <div className="mb-6 flex flex-wrap gap-2">
        {["", "A", "B", "C", "D"].map((g) => (
          <a
            key={g || "all"}
            href={g ? `/fixtures?group=${g}` : "/fixtures"}
            className={`rounded-full px-3 py-1 text-sm font-medium ${
              (params.group || "") === g
                ? "bg-league-primary text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {g ? `Group ${g}` : "All"}
          </a>
        ))}
      </div>

      {matches.length === 0 ? (
        <p className="card p-8 text-center text-slate-500">No fixtures found.</p>
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
