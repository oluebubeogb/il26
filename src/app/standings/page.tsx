import { calculateOverallStandings } from "@/lib/standings";
import { StandingsTable } from "@/components/StandingsTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Overall Standings" };

export default async function StandingsPage() {
  const rows = await calculateOverallStandings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Overall Ranking</h1>
      <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <strong>Note:</strong> This is a cross-group comparison only. Qualification for the
        knockout stage is determined solely by each team&apos;s position within its own group
        (top two per group). Points from different groups are not compared for qualification.
      </div>

      <div className="card p-4">
        <StandingsTable rows={rows} showGroup />
      </div>
    </div>
  );
}
