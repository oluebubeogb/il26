"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<"identify" | "reset">("identify");
  const [identifier, setIdentifier] = useState("");
  const [birthYear, setBirthYear] = useState("");
  const [token, setToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleIdentify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier,
          birthYear: parseInt(birthYear, 10),
          action: "request",
        }),
      });
      const data = await res.json();
      // Always show generic message
      setMessage(
        data.message ||
          "If the details match an account, you can now set a new password."
      );
      if (data.token) {
        setToken(data.token);
        setStep("reset");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          newPassword,
          action: "reset",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Reset failed");
        return;
      }
      setMessage("Password updated. You can now log in.");
      setStep("identify");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-2 text-center text-2xl font-bold">Account Recovery</h1>
      <p className="mb-6 text-center text-sm text-slate-500">
        Fan accounts only. Use username/phone + year of birth.
      </p>

      {step === "identify" ? (
        <form onSubmit={handleIdentify} className="card space-y-4 p-6">
          {message && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">Username or Phone</label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Year of Birth</label>
            <input
              type="number"
              required
              value={birthYear}
              onChange={(e) => setBirthYear(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-league-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Checking…" : "Continue"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="card space-y-4 p-6">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}
          <div>
            <label className="mb-1 block text-sm font-medium">New Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-league-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Updating…" : "Set new password"}
          </button>
        </form>
      )}

      <p className="mt-4 text-center text-sm">
        <Link href="/login" className="text-league-primary hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
