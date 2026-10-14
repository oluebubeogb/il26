import { prisma } from "./prisma";

export type StandingRow = {
  position: number;
  teamId: string;
  teamName: string;
  teamSlug: string;
  shortName: string | null;
  groupCode: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

type TeamStats = {
  teamId: string;
  teamName: string;
  teamSlug: string;
  shortName: string | null;
  groupCode: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
};

function emptyStats(
  teamId: string,
  teamName: string,
  teamSlug: string,
  shortName: string | null,
  groupCode: string
): TeamStats {
  return {
    teamId,
    teamName,
    teamSlug,
    shortName,
    groupCode,
    played: 0,
    won: 0,
    drawn: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
  };
}

/**
 * Calculate standings for a single group from completed group-stage matches.
 * Sorting: Points DESC → GD DESC → GF DESC
 * (Head-to-head can be added later; currently deterministic by points/GD/GF)
 */
export async function calculateGroupStandings(groupCode: string): Promise<StandingRow[]> {
  const group = await prisma.group.findUnique({
    where: { code: groupCode },
    include: { teams: true },
  });
  if (!group) return [];

  const matches = await prisma.match.findMany({
    where: {
      stage: "GROUP",
      groupId: group.id,
      status: "FULL_TIME",
      fullTimeHomeScore: { not: null },
      fullTimeAwayScore: { not: null },
    },
  });

  const stats = new Map<string, TeamStats>();
  for (const t of group.teams) {
    stats.set(
      t.id,
      emptyStats(t.id, t.name, t.slug, t.shortName, group.code)
    );
  }

  for (const m of matches) {
    if (m.homeTeamId == null || m.awayTeamId == null) continue;
    const home = stats.get(m.homeTeamId);
    const away = stats.get(m.awayTeamId);
    if (!home || !away) continue;

    const hg = m.fullTimeHomeScore!;
    const ag = m.fullTimeAwayScore!;

    home.played += 1;
    away.played += 1;
    home.goalsFor += hg;
    home.goalsAgainst += ag;
    away.goalsFor += ag;
    away.goalsAgainst += hg;

    if (hg > ag) {
      home.won += 1;
      away.lost += 1;
    } else if (hg < ag) {
      away.won += 1;
      home.lost += 1;
    } else {
      home.drawn += 1;
      away.drawn += 1;
    }
  }

  const rows: StandingRow[] = Array.from(stats.values()).map((s) => ({
    ...s,
    goalDifference: s.goalsFor - s.goalsAgainst,
    points: s.won * 3 + s.drawn,
    position: 0,
  }));

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });

  rows.forEach((r, i) => {
    r.position = i + 1;
  });

  return rows;
}

export async function calculateAllGroupStandings() {
  const codes = ["A", "B", "C", "D"];
  const result: Record<string, StandingRow[]> = {};
  for (const code of codes) {
    result[code] = await calculateGroupStandings(code);
  }
  return result;
}

/**
 * Overall ranking across all 16 teams (comparison only, does NOT affect qualification).
 */
export async function calculateOverallStandings(): Promise<StandingRow[]> {
  const all = await calculateAllGroupStandings();
  const rows = Object.values(all).flat();

  rows.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.teamName.localeCompare(b.teamName);
  });

  rows.forEach((r, i) => {
    r.position = i + 1;
  });

  return rows;
}
