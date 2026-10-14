import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { isPredictionOpen } from "@/lib/predictions";
import { z } from "zod";

const schema = z.object({
  matchId: z.string().min(1),
  type: z.enum(["OUTCOME", "CORRECT_SCORE", "DOUBLE_CHANCE"]),
  selectedOutcome: z.string().optional(),
  homeScore: z.number().int().min(0).max(20).optional(),
  awayScore: z.number().int().min(0).max(20).optional(),
  comment: z.string().max(280).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Login required" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { matchId, type, selectedOutcome, homeScore, awayScore, comment } =
      parsed.data;

    const match = await prisma.match.findUnique({ where: { id: matchId } });
    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }
    if (!isPredictionOpen(match)) {
      return NextResponse.json(
        { error: "Predictions are closed for this match" },
        { status: 403 }
      );
    }

    if (type === "OUTCOME" && !["HOME", "DRAW", "AWAY"].includes(selectedOutcome || "")) {
      return NextResponse.json({ error: "Invalid outcome" }, { status: 400 });
    }
    if (type === "CORRECT_SCORE" && (homeScore == null || awayScore == null)) {
      return NextResponse.json({ error: "Scores required" }, { status: 400 });
    }

    // Upsert: one active record per user/match/type (correct-score is unique)
    const prediction = await prisma.prediction.upsert({
      where: {
        userId_matchId_type: { userId: user.id, matchId, type },
      },
      update: {
        selectedOutcome: selectedOutcome || null,
        homeScore: homeScore ?? null,
        awayScore: awayScore ?? null,
        comment: comment || null,
        isCorrect: null, // reset grading
        status: "active",
      },
      create: {
        userId: user.id,
        matchId,
        type,
        selectedOutcome: selectedOutcome || null,
        homeScore: homeScore ?? null,
        awayScore: awayScore ?? null,
        comment: comment || null,
      },
    });

    return NextResponse.json({ ok: true, id: prediction.id });
  } catch (e) {
    console.error("Prediction error", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const matchId = req.nextUrl.searchParams.get("matchId");
  if (!matchId) {
    return NextResponse.json({ error: "matchId required" }, { status: 400 });
  }

  const preds = await prisma.prediction.findMany({
    where: { matchId, status: "active" },
    include: { user: { select: { username: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Never expose phone
  return NextResponse.json({
    predictions: preds.map((p) => ({
      id: p.id,
      username: p.user.username,
      type: p.type,
      selectedOutcome: p.selectedOutcome,
      homeScore: p.homeScore,
      awayScore: p.awayScore,
      comment: p.comment,
      isCorrect: p.isCorrect,
      createdAt: p.createdAt,
    })),
  });
}
