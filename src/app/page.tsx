import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { calculateAllGroupStandings } from "@/lib/standings";
import { MatchCard } from "@/components/MatchCard";
import { StandingsTable } from "@/components/StandingsTable";

export const dynamic = "force-dynamic";

const SPONSOR =
  "Ibeku League 2026 is sponsored by High Chief Dickson Oguguo Nzenwa Aku Bara-Oha 1 Of Ibeku Ancient Kingdom.";

export default async function HomePage() {
  const now = new Date();

  const [upcoming, recent, standings] = await Promise.all([
    prisma.match.findMany({
      where: {
        status: { in: ["SCHEDULED", "LIVE", "HALF_TIME"] },
        OR: [{ kickoffAt: { gte: now } }, { kickoffAt: null }],
      },
      include: {
        homeTeam: true,
        awayTeam: true,
        group: true,
      },
      orderBy: { kickoffAt: "asc" },
      take: 6,
    }),
    prisma.match.findMany({
      where: { status: "FULL_TIME" },
      include: {
        homeTeam: true,
        awayTeam: true,
        group: true,
      },
      orderBy: { kickoffAt: "desc" },
      take: 4,
    }),
    calculateAllGroupStandings(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      {/* Hero */}
      <section className="mb-8 rounded-2xl bg-gradient-to-br from-league-secondary to-league-primary px-6 py-10 text-white">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Ibeku League 2026
        </h1>
        <p className="mt-2 max-w-xl text-teal-100">
          Official competition platform · 11 Oct 2026 – 3 Jan 2027
        </p>
        <p className="mt-4 text-sm text-teal-50/90">{SPONSOR}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/fixtures"
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-league-primary hover:bg-teal-50"
          >
            View Fixtures
          </Link>
          <Link
            href="/groups"
            className="rounded-lg border border-white/40 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
          >
            Group Tables
          </Link>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Upcoming */}
        <section className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Upcoming Fixtures</h2>
            <Link href="/fixtures" className="text-sm font-medium text-league-primary hover:underline">
              View all
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <p className="card p-6 text-center text-sm text-slate-500">
              No upcoming fixtures scheduled.
            </p>
          ) : (
            <div className="space-y-3">
              {upcoming.map((m) => (
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
        </section>

        {/* Quick standings preview */}
        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Group A</h2>
            <Link href="/groups" className="text-sm font-medium text-league-primary hover:underline">
              All groups
            </Link>
          </div>
          <div className="card p-3">
            <StandingsTable rows={standings["A"] || []} />
          </div>
        </section>
      </div>

      {/* Recent results */}
      {recent.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Recent Results</h2>
            <Link href="/results" className="text-sm font-medium text-league-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {recent.map((m) => (
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
      )}
    </div>
  );
}
