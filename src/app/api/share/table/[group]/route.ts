import { NextRequest, NextResponse } from "next/server";
import { calculateGroupStandings } from "@/lib/standings";
import { generateTableCardSvg } from "@/lib/score-card";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ group: string }> }
) {
  const { group } = await params;
  const code = group.toUpperCase();
  if (!["A", "B", "C", "D"].includes(code)) {
    return new NextResponse("Invalid group", { status: 400 });
  }

  const rows = await calculateGroupStandings(code);
  const svg = generateTableCardSvg(
    code,
    rows.map((r) => ({
      pos: r.position,
      name: r.teamName,
      p: r.played,
      w: r.won,
      d: r.drawn,
      l: r.lost,
      gd: r.goalDifference,
      pts: r.points,
    }))
  );

  return new NextResponse(svg, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=60",
      "Content-Disposition": `inline; filename="ibeku-group-${code}.svg"`,
    },
  });
}
