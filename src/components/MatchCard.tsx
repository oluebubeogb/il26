import Link from "next/link";
import { formatMatchDate, formatMatchTime, statusLabel, statusColor, teamInitials } from "@/lib/utils";

type TeamInfo = {
  id: string;
  name: string;
  slug: string;
  shortName: string | null;
} | null;

type MatchCardProps = {
  id: string;
  homeTeam: TeamInfo;
  awayTeam: TeamInfo;
  homeSlot?: string | null;
  awaySlot?: string | null;
  kickoffAt: Date | string | null;
  status: string;
  halfTimeHomeScore?: number | null;
  halfTimeAwayScore?: number | null;
  fullTimeHomeScore?: number | null;
  fullTimeAwayScore?: number | null;
  groupCode?: string | null;
  stage?: string;
  round?: string | null;
};

export function MatchCard(m: MatchCardProps) {
  const homeName = m.homeTeam?.name ?? m.homeSlot ?? "TBD";
  const awayName = m.awayTeam?.name ?? m.awaySlot ?? "TBD";
  const homeSlug = m.homeTeam?.slug;
  const awaySlug = m.awayTeam?.slug;
  const isFinished = m.status === "FULL_TIME";
  const hasScore =
    m.fullTimeHomeScore != null && m.fullTimeAwayScore != null;

  return (
    <Link
      href={`/matches/${m.id}`}
      className="card block p-4 transition hover:border-league-primary/40 hover:shadow-md"
    >
      <div className="mb-3 flex items-center justify-between gap-2 text-xs text-slate-500">
        <span>
          {formatMatchDate(m.kickoffAt)}
          {m.groupCode && ` · Group ${m.groupCode}`}
          {m.round && ` · ${m.round}`}
        </span>
        <span className={`badge ${statusColor(m.status)}`}>
          {statusLabel(m.status)}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            {teamInitials(homeName, m.homeTeam?.shortName)}
          </span>
          <span className="truncate font-medium text-slate-900">
            {homeSlug ? (
              <span>{homeName}</span>
            ) : (
              <span className="text-slate-500 italic">{homeName}</span>
            )}
          </span>
        </div>

        <div className="flex min-w-[4.5rem] flex-col items-center">
          {hasScore ? (
            <span className="text-lg font-bold tabular-nums text-slate-900">
              {m.fullTimeHomeScore} – {m.fullTimeAwayScore}
            </span>
          ) : (
            <span className="text-sm font-medium text-slate-400">
              {formatMatchTime(m.kickoffAt)}
            </span>
          )}
          {isFinished &&
            m.halfTimeHomeScore != null &&
            m.halfTimeAwayScore != null && (
              <span className="text-[10px] text-slate-400">
                HT {m.halfTimeHomeScore}-{m.halfTimeAwayScore}
              </span>
            )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-2">
          <span className="truncate text-right font-medium text-slate-900">
            {awaySlug ? (
              <span>{awayName}</span>
            ) : (
              <span className="text-slate-500 italic">{awayName}</span>
            )}
          </span>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
            {teamInitials(awayName, m.awayTeam?.shortName)}
          </span>
        </div>
      </div>
    </Link>
  );
}
