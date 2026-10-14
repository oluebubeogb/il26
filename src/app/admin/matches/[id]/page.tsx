import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin, audit } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function updateMatch(formData: FormData) {
  "use server";
  const user = await requireAdmin();
  const id = formData.get("id") as string;

  const status = formData.get("status") as string;
  const venue = (formData.get("venue") as string) || null;
  const notes = (formData.get("notes") as string) || null;
  const htHome = formData.get("htHome") as string;
  const htAway = formData.get("htAway") as string;
  const ftHome = formData.get("ftHome") as string;
  const ftAway = formData.get("ftAway") as string;
  const kickoffDate = formData.get("kickoffDate") as string;
  const kickoffTime = formData.get("kickoffTime") as string;

  let kickoffAt: Date | null | undefined = undefined;
  if (kickoffDate) {
    const [y, m, d] = kickoffDate.split("-").map(Number);
    let hours = 0;
    let mins = 0;
    if (kickoffTime) {
      const [hh, mm] = kickoffTime.split(":").map(Number);
      hours = hh;
      mins = mm;
    }
    // Store as UTC approximating Lagos (UTC+1) for simplicity
    kickoffAt = new Date(Date.UTC(y, m - 1, d, hours - 1, mins));
  }

  const data: Record<string, unknown> = {
    status,
    venue,
    notes,
    halfTimeHomeScore: htHome !== "" ? parseInt(htHome, 10) : null,
    halfTimeAwayScore: htAway !== "" ? parseInt(htAway, 10) : null,
    fullTimeHomeScore: ftHome !== "" ? parseInt(ftHome, 10) : null,
    fullTimeAwayScore: ftAway !== "" ? parseInt(ftAway, 10) : null,
  };
  if (kickoffAt !== undefined) data.kickoffAt = kickoffAt;

  await prisma.match.update({ where: { id }, data });

  await audit(user.id, "MATCH_UPDATE", "Match", id, {
    status,
    ftHome,
    ftAway,
  });

  revalidatePath("/");
  revalidatePath("/fixtures");
  revalidatePath("/results");
  revalidatePath("/groups");
  revalidatePath("/standings");
  revalidatePath(`/matches/${id}`);
  revalidatePath("/admin/matches");

  redirect(`/admin/matches/${id}?saved=1`);
}

export default async function AdminMatchEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const sp = await searchParams;

  const match = await prisma.match.findUnique({
    where: { id },
    include: { homeTeam: true, awayTeam: true, group: true },
  });
  if (!match) notFound();

  const homeName = match.homeTeam?.name ?? match.homeSlot ?? "TBD";
  const awayName = match.awayTeam?.name ?? match.awaySlot ?? "TBD";

  let dateVal = "";
  let timeVal = "";
  if (match.kickoffAt) {
    const d = new Date(match.kickoffAt);
    // approximate back to Lagos display
    dateVal = d.toISOString().slice(0, 10);
    const h = d.getUTCHours() + 1;
    const m = d.getUTCMinutes();
    if (h !== 1 || m !== 0) {
      timeVal = `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    }
  }

  return (
    <div>
      <div className="mb-4">
        <Link href="/admin/matches" className="text-sm text-league-primary hover:underline">
          ← Back to matches
        </Link>
      </div>

      <h2 className="mb-1 text-lg font-bold">
        {homeName} vs {awayName}
      </h2>
      <p className="mb-6 text-sm text-slate-500">
        {match.group ? `Group ${match.group.code}` : match.round || match.stage}
      </p>

      {sp.saved && (
        <div className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Match updated successfully. Standings will recalculate automatically.
        </div>
      )}

      <form action={updateMatch} className="card max-w-lg space-y-4 p-6">
        <input type="hidden" name="id" value={match.id} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Date</label>
            <input
              type="date"
              name="kickoffDate"
              defaultValue={dateVal}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Kick-off (Lagos)</label>
            <input
              type="time"
              name="kickoffTime"
              defaultValue={timeVal}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
            <p className="mt-0.5 text-xs text-slate-400">Leave empty for Time TBC</p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Status</label>
          <select
            name="status"
            defaultValue={match.status}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="SCHEDULED">Scheduled</option>
            <option value="LIVE">Live</option>
            <option value="HALF_TIME">Half-time</option>
            <option value="FULL_TIME">Full-time</option>
            <option value="POSTPONED">Postponed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">HT Home</label>
            <input
              type="number"
              name="htHome"
              min={0}
              defaultValue={match.halfTimeHomeScore ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">HT Away</label>
            <input
              type="number"
              name="htAway"
              min={0}
              defaultValue={match.halfTimeAwayScore ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="mb-1 block text-sm font-medium">FT Home</label>
            <input
              type="number"
              name="ftHome"
              min={0}
              defaultValue={match.fullTimeHomeScore ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">FT Away</label>
            <input
              type="number"
              name="ftAway"
              min={0}
              defaultValue={match.fullTimeAwayScore ?? ""}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Venue</label>
          <input
            type="text"
            name="venue"
            defaultValue={match.venue ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium">Notes</label>
          <textarea
            name="notes"
            rows={3}
            defaultValue={match.notes ?? ""}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-league-primary py-2.5 text-sm font-semibold text-white hover:bg-league-secondary"
        >
          Save Match
        </button>
      </form>
    </div>
  );
}
