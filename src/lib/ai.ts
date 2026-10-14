import { prisma } from "./prisma";

const AI_ENABLED = process.env.AI_ENABLED !== "false";
const BASE_URL = process.env.LLM_BASE_URL || "";
const API_KEY = process.env.LLM_API_KEY || "";
const MODEL = process.env.LLM_MODEL || "";
const TIMEOUT = parseInt(process.env.LLM_TIMEOUT_SECONDS || "120", 10) * 1000;
const MAX_TOKENS = parseInt(process.env.LLM_MAX_OUTPUT_TOKENS || "1500", 10);

export function isAiConfigured(): boolean {
  return AI_ENABLED && !!BASE_URL && !!API_KEY && !!MODEL;
}

export async function callLlm(
  system: string,
  user: string
): Promise<{ content: string; model: string } | { error: string }> {
  if (!isAiConfigured()) {
    return { error: "AI is not configured or disabled" };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const res = await fetch(`${BASE_URL.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        max_tokens: MAX_TOKENS,
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return { error: `LLM HTTP ${res.status}: ${text.slice(0, 200)}` };
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return { error: "Empty LLM response" };
    return { content, model: MODEL };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: msg.includes("abort") ? "LLM timeout" : msg };
  } finally {
    clearTimeout(timer);
  }
}

export async function enqueueAiJob(
  type: "GENERATE_PREVIEW" | "GENERATE_POST_MATCH",
  payload: Record<string, unknown>
) {
  return prisma.aIJob.create({
    data: {
      type,
      payload,
      status: "queued",
      availableAt: new Date(),
    },
  });
}

export async function processNextAiJob(): Promise<boolean> {
  if (!isAiConfigured()) return false;

  const job = await prisma.aIJob.findFirst({
    where: {
      status: "queued",
      availableAt: { lte: new Date() },
    },
    orderBy: { createdAt: "asc" },
  });

  if (!job) return false;

  await prisma.aIJob.update({
    where: { id: job.id },
    data: {
      status: "running",
      startedAt: new Date(),
      attempts: { increment: 1 },
    },
  });

  try {
    const payload = job.payload as { matchId?: string };
    const matchId = payload.matchId;
    if (!matchId) throw new Error("Missing matchId in payload");

    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        homeTeam: true,
        awayTeam: true,
        group: true,
        events: true,
      },
    });
    if (!match) throw new Error("Match not found");

    const home = match.homeTeam?.name ?? match.homeSlot ?? "TBD";
    const away = match.awayTeam?.name ?? match.awaySlot ?? "TBD";
    const group = match.group?.code ? `Group ${match.group.code}` : match.stage;

    let system = "";
    let user = "";
    let analysisType = "PREVIEW";

    if (job.type === "GENERATE_PREVIEW") {
      analysisType = "PREVIEW";
      system = `You are a football analyst for Ibeku League 2026 (Nigeria). Write a short pre-match preview (150-250 words). Use only the facts provided. Do not invent players, scores, injuries or history. Clearly label any estimates as AI estimates.`;
      user = `Match: ${home} vs ${away}\nStage: ${group}\nStatus: ${match.status}\nVenue: ${match.venue || "TBC"}\nWrite a neutral preview.`;
    } else {
      analysisType = "POST_MATCH";
      system = `You are a football analyst for Ibeku League 2026. Write a short post-match summary (150-250 words) based only on the verified result and events provided. Do not invent scorers or events.`;
      const score =
        match.fullTimeHomeScore != null
          ? `${match.fullTimeHomeScore}-${match.fullTimeAwayScore}`
          : "N/A";
      const events = match.events
        .map(
          (e) =>
            `${e.minute}' ${e.eventType}${e.ownGoal ? " (OG)" : ""}`
        )
        .join("; ");
      user = `Match: ${home} vs ${away}\nFinal score: ${score}\nHT: ${match.halfTimeHomeScore ?? "-"}-${match.halfTimeAwayScore ?? "-"}\nEvents: ${events || "none recorded"}\nWrite a factual post-match summary.`;
    }

    const result = await callLlm(system, user);

    if ("error" in result) {
      await prisma.aIJob.update({
        where: { id: job.id },
        data: {
          status: "failed",
          lastError: result.error.slice(0, 500),
          completedAt: new Date(),
          availableAt: new Date(Date.now() + 5 * 60 * 1000), // retry later
        },
      });
      return true;
    }

    const analysis = await prisma.aIAnalysis.create({
      data: {
        matchId,
        analysisType,
        model: result.model,
        promptVersion: "v1",
        content: result.content,
        status: process.env.AI_AUTO_PUBLISH === "true" ? "published" : "draft",
        publishedAt:
          process.env.AI_AUTO_PUBLISH === "true" ? new Date() : null,
      },
    });

    await prisma.aIJob.update({
      where: { id: job.id },
      data: {
        status: "ready",
        resultId: analysis.id,
        completedAt: new Date(),
      },
    });

    return true;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown";
    await prisma.aIJob.update({
      where: { id: job.id },
      data: {
        status: "failed",
        lastError: msg.slice(0, 500),
        completedAt: new Date(),
      },
    });
    return true;
  }
}
