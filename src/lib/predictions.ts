import { prisma } from "./prisma";

export type Outcome = "HOME" | "DRAW" | "AWAY";

export function resultOutcome(home: number, away: number): Outcome {
  if (home > away) return "HOME";
  if (home < away) return "AWAY";
  return "DRAW";
}

export function isPredictionOpen(match: {
  status: string;
  predictionCutoff: Date | null;
  kickoffAt: Date | null;
}): boolean {
  if (["LIVE", "HALF_TIME", "FULL_TIME", "CANCELLED"].includes(match.status)) {
    return false;
  }
  if (match.predictionCutoff && new Date() >= match.predictionCutoff) {
    return false;
  }
  // Default: open while SCHEDULED or POSTPONED
  return true;
}

/** Grade all predictions for a match after full-time */
export async function gradeMatchPredictions(matchId: string) {
  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (
    !match ||
    match.status !== "FULL_TIME" ||
    match.fullTimeHomeScore == null ||
    match.fullTimeAwayScore == null
  ) {
    return;
  }

  const outcome = resultOutcome(
    match.fullTimeHomeScore,
    match.fullTimeAwayScore
  );

  const predictions = await prisma.prediction.findMany({
    where: { matchId, status: "active" },
  });

  for (const p of predictions) {
    let isCorrect = false;
    if (p.type === "OUTCOME" && p.selectedOutcome) {
      isCorrect = p.selectedOutcome === outcome;
    } else if (p.type === "DOUBLE_CHANCE" && p.selectedOutcome) {
      const map: Record<string, Outcome[]> = {
        HOME_DRAW: ["HOME", "DRAW"],
        DRAW_AWAY: ["DRAW", "AWAY"],
        HOME_AWAY: ["HOME", "AWAY"],
      };
      isCorrect = (map[p.selectedOutcome] || []).includes(outcome);
    } else if (p.type === "CORRECT_SCORE") {
      isCorrect =
        p.homeScore === match.fullTimeHomeScore &&
        p.awayScore === match.fullTimeAwayScore;
    }
    await prisma.prediction.update({
      where: { id: p.id },
      data: { isCorrect },
    });
  }
}

export async function getPredictionCounts(matchId: string) {
  const preds = await prisma.prediction.findMany({
    where: { matchId, status: "active", type: "OUTCOME" },
    select: { selectedOutcome: true },
  });
  const counts = { HOME: 0, DRAW: 0, AWAY: 0, total: preds.length };
  for (const p of preds) {
    if (p.selectedOutcome === "HOME") counts.HOME++;
    else if (p.selectedOutcome === "DRAW") counts.DRAW++;
    else if (p.selectedOutcome === "AWAY") counts.AWAY++;
  }
  return counts;
}
