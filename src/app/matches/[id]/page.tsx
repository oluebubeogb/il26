import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  formatMatchDateTime,
  statusLabel,
  statusColor,
  teamInitials,
} from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function MatchPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      homeTeam: true,
      awayTeam: true,
      group: true,
      events: { orderBy: { minute: "asc" } },
    },
  });

  if (!match) notFound();

  const homeName = match.homeTeam?.name ?? match.homeSlot ?? "TBD";
  const awayName = match.awayTeam?.name ?? match.awaySlot ?? "TBD";
  const hasScore =
    match.fullTimeHomeScore != null && match.fullTimeAwayScore != null;

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between text-sm text-slate-500">
        <span>
          {match.group && `Group ${match.group.code}`}
          {match.round && ` · ${match.round}`}
          {match.stage !== "GROUP" && !match.round && ` · ${match.stage}`}
        </span>
        <span className={`badge ${statusColor(match.status)}`}>
          {statusLabel(match.status)}
        </span>
      </div>

      <div className="card p-6 text-center">
        <p className="mb-4 text-sm text-slate-500">
          {formatMatchDateTime(match.kickoffAt)}
          {match.venue && ` · ${match.venue}`}
        </p>

        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
              {teamInitials(homeName, match.homeTeam?.shortName)}
            </span>
            {match.homeTeam ? (
              <Link
                href={`/teams/${match.homeTeam.slug}`}
                className="font-semibold hover:text-league-primary"
              >
                {homeName}
              </Link>
            ) : (
              <span className="font-semibold text-slate-500 italic">{homeName}</span>
            )}
          </div>

          <div className="min-w-[5rem]">
            {hasScore ? (
              <>
                <p className="text-3xl font-bold tabular-nums">
                  {match.fullTimeHomeScore} – {match.fullTimeAwayScore}
                </p>
                {match.halfTimeHomeScore != null &&
                  match.halfTimeAwayScore != null && (
                    <p className="mt-1 text-xs text-slate-400">
                      HT {match.halfTimeHomeScore}-{match.halfTimeAwayScore}
                    </p>
                  )}
              </>
            ) : (
              <p className="text-lg font-medium text-slate-400">vs</p>
            )}
          </div>

          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-lg font-bold text-slate-600">
              {teamInitials(awayName, match.awayTeam?.shortName)}
            </span>
            {match.awayTeam ? (
              <Link
                href={`/teams/${match.awayTeam.slug}`}
                className="font-semibold hover:text-league-primary"
              >
                {awayName}
              </Link>
            ) : (
              <span className="font-semibold text-slate-500 italic">{awayName}</span>
            )}
          </div>
        </div>
      </div>

      {match.notes && (
        <div className="mt-4 card p-4">
          <h3 className="mb-1 text-sm font-semibold text-slate-700">Match Notes</h3>
          <p className="text-sm text-slate-600 whitespace-pre-wrap">{match.notes}</p>
        </div>
      )}

      {match.events.length > 0 && (
        <div className="mt-4 card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">Events</h3>
          <ul className="space-y-2 text-sm">
            {match.events.map((e) => (
              <li key={e.id} className="flex gap-3">
                <span className="w-10 shrink-0 font-mono text-slate-400">
                  {e.minute}&apos;
                </span>
                <span>
                  {e.eventType.replace("_", " ")}
                  {e.ownGoal && " (OG)"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Share score card */}
      <div className="mt-4 card p-4">
        <h3 className="mb-2 text-sm font-semibold text-slate-700">Share</h3>
        <a
          href={`/api/share/score/${match.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-lg bg-league-primary px-4 py-2 text-sm font-medium text-white hover:bg-league-secondary"
        >
          Download score card
        </a>
      </div>
    </div>
  );
}
