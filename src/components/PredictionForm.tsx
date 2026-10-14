"use client";

import { useState } from "react";

export function PredictionForm({ matchId }: { matchId: string }) {
  const [outcome, setOutcome] = useState<"HOME" | "DRAW" | "AWAY" | "">("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [comment, setComment] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(type: "OUTCOME" | "CORRECT_SCORE") {
    setError("");
    setMsg("");
    setLoading(true);
    try {
      const body: Record<string, unknown> = { matchId, type, comment: comment || undefined };
      if (type === "OUTCOME") {
        if (!outcome) {
          setError("Select an outcome");
          setLoading(false);
          return;
        }
        body.selectedOutcome = outcome;
      } else {
        body.homeScore = parseInt(homeScore, 10);
        body.awayScore = parseInt(awayScore, 10);
        if (isNaN(body.homeScore as number) || isNaN(body.awayScore as number)) {
          setError("Enter valid scores");
          setLoading(false);
          return;
        }
      }
      const res = await fetch("/api/predictions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      setMsg(type === "OUTCOME" ? "Outcome prediction saved" : "Correct score saved");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-slate-400">
        Predictions are for entertainment only. No money is staked.
      </p>
      {msg && (
        <p className="rounded bg-emerald-50 px-3 py-1.5 text-sm text-emerald-800">{msg}</p>
      )}
      {error && (
        <p className="rounded bg-red-50 px-3 py-1.5 text-sm text-red-700">{error}</p>
      )}

      <div>
        <p className="mb-2 text-sm font-medium">Match outcome</p>
        <div className="flex flex-wrap gap-2">
          {(["HOME", "DRAW", "AWAY"] as const).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOutcome(o)}
              className={`rounded-lg px-4 py-2 text-sm font-medium ${
                outcome === o
                  ? "bg-league-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {o === "HOME" ? "Home" : o === "DRAW" ? "Draw" : "Away"}
            </button>
          ))}
          <button
            type="button"
            disabled={loading}
            onClick={() => submit("OUTCOME")}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Save outcome
          </button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium">Correct score (one per match)</p>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="number"
            min={0}
            max={20}
            value={homeScore}
            onChange={(e) => setHomeScore(e.target.value)}
            className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-sm"
            placeholder="H"
          />
          <span className="text-slate-400">–</span>
          <input
            type="number"
            min={0}
            max={20}
            value={awayScore}
            onChange={(e) => setAwayScore(e.target.value)}
            className="w-16 rounded-lg border border-slate-300 px-2 py-1.5 text-center text-sm"
            placeholder="A"
          />
          <button
            type="button"
            disabled={loading}
            onClick={() => submit("CORRECT_SCORE")}
            className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            Save score
          </button>
        </div>
      </div>

      <div>
        <input
          type="text"
          maxLength={280}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Optional comment"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>
    </div>
  );
}
