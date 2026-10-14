import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateScoreCardSvg } from "@/lib/score-card";
import { formatMatchDate, teamInitials } from "@/lib/utils";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> }
) {
  const { matchId } = await params;
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    include: { homeTeam: true, awayTeam: true, group: true },
  });

  if (!match) {
    return new NextResponse("Not found", { status: 404 });
  }

  // Only show confirmed scores as full-time
  const homeScore =
    match.status === "FULL_TIME" || match.status === "HALF_TIME" || match.status === "LIVE"
      ? match.fullTimeHomeScore
      : null;
  const awayScore =
    match.status === "FULL_TIME" || match.status === "HALF_TIME" || match.status === "LIVE"
      ? match.fullTimeAwayScore
      : null;

  const svg = generateScoreCardSvg({
    homeName: match.homeTeam?.name ?? match.homeSlot ?? "TBD",
    awayName: match.awayTeam?.name ?? match.awaySlot ?? "TBD",
    homeScore,
    awayScore,
    htHome: match.halfTimeHomeScore,
    htAway: match.halfTimeAwayScore,
    dateLabel: formatMatchDate(match.kickoffAt),
    groupOrRound: match.group
      ? `Group ${match.group.code}`
      : match.round || match.stage,
    status: match.status,
    homeInitials: teamInitials(
      match.homeTeam?.name ?? "TBD",
      match.homeTeam?.shortName
    ),
    awayInitials: teamInitials(
      match.awayTeam?.name ?? "TBD",
      match.awayTeam?.shortName
    ),
  });

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60",
      "Content-Disposition": `inline; filename="ibeku-${matchId}.svg"`,
    },
  });
}
