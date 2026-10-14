import { prisma } from "@/lib/prisma";
import { requireAdmin, audit } from "@/lib/auth";
import { parsePlayerCsv } from "@/lib/csv-import";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";

async function importCsv(formData: FormData) {
  "use server";
  const user = await requireAdmin();
  const teamId = formData.get("teamId") as string;
  const file = formData.get("file") as File;
  const commit = formData.get("commit") === "1";

  if (!teamId || !file) return;

  const text = await file.text();
  const { rows } = parsePlayerCsv(text);

  const valid = rows.filter((r) => r.status === "valid" && r.fullName);
  const errors = rows.filter((r) => r.status === "error");

  if (!commit) {
    // Preview only — store report
    await prisma.playerImport.create({
      data: {
        teamId,
        uploadedByAdminId: user.id,
        filename: file.name,
        totalRows: rows.length,
        successCount: valid.length,
        errorCount: errors.length,
        status: "pending",
        reportJson: { rows, preview: true },
      },
    });
    revalidatePath("/admin/import");
    return;
  }

  let success = 0;
  for (const r of valid) {
    if (!r.fullName) continue;
    const normalizedName = r.fullName.toLowerCase().replace(/\s+/g, " ");
    const existing = await prisma.player.findUnique({
      where: { teamId_normalizedName: { teamId, normalizedName } },
    });
    if (existing) {
      // Merge: do not overwrite non-empty with blank
      await prisma.player.update({
        where: { id: existing.id },
        data: {
          position: r.position || existing.position,
          age: r.age ?? existing.age,
          phone: r.phone || existing.phone,
          jerseyNumber: r.jerseyNumber ?? existing.jerseyNumber,
        },
      });
    } else {
      await prisma.player.create({
        data: {
          teamId,
          fullName: r.fullName,
          normalizedName,
          position: r.position,
          age: r.age,
          phone: r.phone,
          jerseyNumber: r.jerseyNumber,
        },
      });
    }
    success++;
  }

  await prisma.playerImport.create({
    data: {
      teamId,
      uploadedByAdminId: user.id,
      filename: file.name,
      totalRows: rows.length,
      successCount: success,
      errorCount: errors.length,
      status: errors.length > 0 ? "partial" : "committed",
      reportJson: {
        errors: errors.map((e) => ({
          row: e.rowNumber,
          error: e.error,
          name: e.fullName,
        })),
      },
    },
  });

  await audit(user.id, "PLAYER_CSV_IMPORT", "Team", teamId, {
    success,
    errors: errors.length,
  });
  revalidatePath("/admin/import");
  revalidatePath("/admin/players");
}

export default async function AdminImportPage() {
  await requireAdmin();
  const teams = await prisma.team.findMany({
    include: { group: true },
    orderBy: { name: "asc" },
  });
  const recent = await prisma.playerImport.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">CSV Player Import</h2>
      <p className="mb-4 text-sm text-slate-500">
        Required column: player name. Optional: position, age, phone, jersey.
        Headers such as name, player, full_name, position, age, phone,
        jersey_number are recognised. Blank optional fields do not erase
        existing data.
      </p>

      <form action={importCsv} className="card mb-8 max-w-lg space-y-3 p-4">
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
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          className="w-full text-sm"
        />
        <input type="hidden" name="commit" value="1" />
        <button
          type="submit"
          className="rounded-lg bg-league-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Import CSV
        </button>
      </form>

      <h3 className="mb-2 font-semibold">Recent imports</h3>
      <div className="card divide-y divide-slate-100 text-sm">
        {recent.length === 0 && (
          <p className="p-4 text-slate-400">No imports yet.</p>
        )}
        {recent.map((imp) => (
          <div key={imp.id} className="flex justify-between px-4 py-3">
            <span>
              {imp.filename} · {imp.successCount}/{imp.totalRows} ok
              {imp.errorCount > 0 && (
                <span className="text-red-600"> · {imp.errorCount} errors</span>
              )}
            </span>
            <span className="text-slate-400">
              {imp.status} · {imp.createdAt.toISOString().slice(0, 10)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
