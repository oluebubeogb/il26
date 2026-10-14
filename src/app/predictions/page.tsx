import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isPredictionOpen } from "@/lib/predictions";
import { MatchCard } from "@/components/MatchCard";
import { PredictionForm } from "@/components/PredictionForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Predictions" };

export default async function PredictionsPage() {
  const user = await getCurrentUser();

  const matches = await prisma.match.findMany({
    where: {
      status: { in: ["SCHEDULED", "POSTPONED"] },
      stage: "GROUP",
    },
    include: { homeTeam: true, awayTeam: true, group: true },
    orderBy: { kickoffAt: "asc" },
    take: 12,
  });

  const openMatches = matches.filter((m) => isPredictionOpen(m));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Predictions</h1>

      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Entertainment only.</strong> Predictions are for fun and fan
        engagement. No money, stakes, deposits or prizes are involved through
        this platform.
      </div>

      {!user && (
        <p className="mb-6 text-sm text-slate-600">
          <Link href="/login" className="font-medium text-league-primary hover:underline">
            Log in
          </Link>{" "}
          or{" "}
          <Link href="/signup" className="font-medium text-league-primary hover:underline">
            sign up
          </Link>{" "}
          to submit predictions.
        </p>
      )}

      {openMatches.length === 0 ? (
        <p className="card p-8 text-center text-slate-500">
          No open matches for prediction right now.
        </p>
      ) : (
        <div className="space-y-6">
          {openMatches.map((m) => (
            <div key={m.id} className="card overflow-hidden">
              <MatchCard
                id={m.id}
                homeTeam={m.homeTeam}
                awayTeam={m.awayTeam}
                homeSlot={m.homeSlot}
                awaySlot={m.awaySlot}
                kickoffAt={m.kickoffAt}
                status={m.status}
                groupCode={m.group?.code}
                stage={m.stage}
                round={m.round}
              />
              {user && (
                <div className="border-t border-slate-100 p-4">
                  <PredictionForm matchId={m.id} />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
