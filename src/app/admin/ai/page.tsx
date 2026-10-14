import { prisma } from "@/lib/prisma";
import { requireAdmin, audit } from "@/lib/auth";
import { enqueueAiJob, isAiConfigured, processNextAiJob } from "@/lib/ai";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function generatePreview(formData: FormData) {
  "use server";
  const user = await requireAdmin();
  const matchId = formData.get("matchId") as string;
  if (!matchId) return;
  await enqueueAiJob("GENERATE_PREVIEW", { matchId });
  await processNextAiJob(); // process one job inline for simplicity
  await audit(user.id, "AI_ENQUEUE_PREVIEW", "Match", matchId);
  revalidatePath("/admin/ai");
}

async function generatePostMatch(formData: FormData) {
  "use server";
  const user = await requireAdmin();
  const matchId = formData.get("matchId") as string;
  if (!matchId) return;
  await enqueueAiJob("GENERATE_POST_MATCH", { matchId });
  await processNextAiJob();
  await audit(user.id, "AI_ENQUEUE_POST", "Match", matchId);
  revalidatePath("/admin/ai");
}

async function publishAnalysis(formData: FormData) {
  "use server";
  const user = await requireAdmin();
  const id = formData.get("id") as string;
  await prisma.aIAnalysis.update({
    where: { id },
    data: { status: "published", publishedAt: new Date(), reviewedBy: user.id },
  });
  await audit(user.id, "AI_PUBLISH", "AIAnalysis", id);
  revalidatePath("/admin/ai");
  revalidatePath("/");
}

async function unpublishAnalysis(formData: FormData) {
  "use server";
  const user = await requireAdmin();
  const id = formData.get("id") as string;
  await prisma.aIAnalysis.update({
    where: { id },
    data: { status: "draft", publishedAt: null },
  });
  await audit(user.id, "AI_UNPUBLISH", "AIAnalysis", id);
  revalidatePath("/admin/ai");
}

export default async function AdminAiPage() {
  await requireAdmin();
  const configured = isAiConfigured();

  const [matches, analyses, jobs] = await Promise.all([
    prisma.match.findMany({
      include: { homeTeam: true, awayTeam: true },
      orderBy: { kickoffAt: "asc" },
      take: 40,
    }),
    prisma.aIAnalysis.findMany({
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { match: { include: { homeTeam: true, awayTeam: true } } },
    }),
    prisma.aIJob.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div>
      <h2 className="mb-2 text-lg font-bold">AI Analysis</h2>
      <p className="mb-4 text-sm text-slate-500">
        RunPod OpenAI-compatible endpoint. Analysis is saved as draft for review
        before publishing. AI uses only verified database data.
      </p>

      {!configured && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          AI is not configured. Set LLM_BASE_URL, LLM_API_KEY, LLM_MODEL and
          AI_ENABLED=true in environment variables. The rest of the site works
          without AI.
        </div>
      )}

      <section className="mb-8">
        <h3 className="mb-3 font-semibold">Generate</h3>
        <div className="card max-h-64 overflow-y-auto divide-y divide-slate-100 text-sm">
          {matches.map((m) => (
            <div
              key={m.id}
              className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
            >
              <span>
                {m.homeTeam?.name ?? m.homeSlot} vs{" "}
                {m.awayTeam?.name ?? m.awaySlot}
                <span className="ml-2 text-slate-400">{m.status}</span>
              </span>
              <div className="flex gap-2">
                <form action={generatePreview}>
                  <input type="hidden" name="matchId" value={m.id} />
                  <button
                    type="submit"
                    disabled={!configured}
                    className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40"
                  >
                    Preview
                  </button>
                </form>
                {m.status === "FULL_TIME" && (
                  <form action={generatePostMatch}>
                    <input type="hidden" name="matchId" value={m.id} />
                    <button
                      type="submit"
                      disabled={!configured}
                      className="rounded border border-slate-300 px-2 py-1 text-xs disabled:opacity-40"
                    >
                      Post-match
                    </button>
                  </form>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h3 className="mb-3 font-semibold">Drafts & published</h3>
        <div className="space-y-3">
          {analyses.length === 0 && (
            <p className="text-sm text-slate-400">No analyses yet.</p>
          )}
          {analyses.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {a.analysisType} · {a.status}
                  {a.match && (
                    <span className="text-slate-500">
                      {" "}
                      — {a.match.homeTeam?.name ?? a.match.homeSlot} vs{" "}
                      {a.match.awayTeam?.name ?? a.match.awaySlot}
                    </span>
                  )}
                </span>
                <div className="flex gap-2">
                  {a.status === "draft" && (
                    <form action={publishAnalysis}>
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        type="submit"
                        className="rounded bg-league-primary px-2 py-1 text-xs text-white"
                      >
                        Publish
                      </button>
                    </form>
                  )}
                  {a.status === "published" && (
                    <form action={unpublishAnalysis}>
                      <input type="hidden" name="id" value={a.id} />
                      <button
                        type="submit"
                        className="rounded border border-slate-300 px-2 py-1 text-xs"
                      >
                        Unpublish
                      </button>
                    </form>
                  )}
                </div>
              </div>
              <p className="whitespace-pre-wrap text-sm text-slate-600 line-clamp-4">
                {a.content}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 font-semibold">Recent jobs</h3>
        <div className="card divide-y divide-slate-100 text-xs">
          {jobs.map((j) => (
            <div key={j.id} className="flex justify-between px-3 py-2">
              <span>
                {j.type} · {j.status}
                {j.lastError && (
                  <span className="text-red-600"> — {j.lastError.slice(0, 80)}</span>
                )}
              </span>
              <span className="text-slate-400">
                {j.createdAt.toISOString().slice(0, 19)}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
