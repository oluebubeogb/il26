import { prisma } from "@/lib/prisma";
import { requireAdmin, audit } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function addPlayer(formData: FormData) {
  "use server";
  const user = await requireAdmin();
  const teamId = formData.get("teamId") as string;
  const fullName = (formData.get("fullName") as string)?.trim();
  const position = (formData.get("position") as string) || null;
  const jersey = formData.get("jersey") as string;

  if (!teamId || !fullName) return;

  const normalizedName = fullName.toLowerCase().replace(/\s+/g, " ");

  await prisma.player.upsert({
    where: {
      teamId_normalizedName: { teamId, normalizedName },
    },
    update: {
      position: position || undefined,
      jerseyNumber: jersey ? parseInt(jersey, 10) : undefined,
    },
    create: {
      teamId,
      fullName,
      normalizedName,
      position,
      jerseyNumber: jersey ? parseInt(jersey, 10) : null,
    },
  });

  await audit(user.id, "PLAYER_UPSERT", "Player", undefined, { fullName, teamId });
  revalidatePath("/admin/players");
}

export default async function AdminPlayersPage() {
  await requireAdmin();
  const teams = await prisma.team.findMany({
    include: { players: { orderBy: { fullName: "asc" } }, group: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Players</h2>

      <form action={addPlayer} className="card mb-8 max-w-lg space-y-3 p-4">
        <h3 className="font-medium">Add / Update Player</h3>
        <select
          name="teamId"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Select team</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} (Group {t.group.code})
            </option>
          ))}
        </select>
        <input
          name="fullName"
          required
          placeholder="Full name"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            name="position"
            placeholder="Position"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="jersey"
            type="number"
            placeholder="Jersey #"
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-league-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Save Player
        </button>
      </form>

      <div className="space-y-6">
        {teams.map((t) => (
          <div key={t.id}>
            <h3 className="mb-2 font-semibold">
              {t.name}{" "}
              <span className="text-sm font-normal text-slate-400">
                ({t.players.length} players)
              </span>
            </h3>
            {t.players.length === 0 ? (
              <p className="text-sm text-slate-400">No players yet.</p>
            ) : (
              <ul className="card divide-y divide-slate-100 text-sm">
                {t.players.map((p) => (
                  <li key={p.id} className="flex justify-between px-3 py-2">
                    <span>{p.fullName}</span>
                    <span className="text-slate-400">
                      {p.position || "—"}
                      {p.jerseyNumber != null && ` · #${p.jerseyNumber}`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
