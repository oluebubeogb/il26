import { calculateAllGroupStandings } from "@/lib/standings";
import { StandingsTable } from "@/components/StandingsTable";

export const dynamic = "force-dynamic";
export const metadata = { title: "Groups" };

export default async function GroupsPage() {
  const standings = await calculateAllGroupStandings();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <h1 className="mb-2 text-2xl font-bold text-slate-900">Group Tables</h1>
      <p className="mb-2 text-sm text-slate-500">
        Top two teams from each group qualify for the quarter-finals.
      </p>
      <p className="mb-6 text-xs text-slate-400">
        Sorting: Points → Goal Difference → Goals For. Qualification is decided within each group only.
      </p>

      <div className="grid gap-8 lg:grid-cols-2">
        {(["A", "B", "C", "D"] as const).map((code) => (
          <section key={code} className="card p-4">
            <h2 className="mb-3 text-lg font-bold text-slate-900">
              Group {code}
            </h2>
            <StandingsTable rows={standings[code] || []} />
          </section>
        ))}
      </div>
    </div>
  );
}
