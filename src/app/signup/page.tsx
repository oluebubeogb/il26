"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    username: "",
    phone: "",
    password: "",
    birthYear: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          birthYear: parseInt(form.birthYear, 10),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Signup failed");
        return;
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-center text-2xl font-bold">Create Account</h1>
      <form onSubmit={handleSubmit} className="card space-y-4 p-6">
        {error && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div>
          <label className="mb-1 block text-sm font-medium">Username</label>
          <input
            type="text"
            required
            minLength={3}
            maxLength={30}
            pattern="[a-zA-Z0-9_]+"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-league-primary focus:outline-none focus:ring-1 focus:ring-league-primary"
            placeholder="letters, numbers, underscore"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Phone Number</label>
          <input
            type="tel"
            required
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-league-primary focus:outline-none focus:ring-1 focus:ring-league-primary"
            placeholder="e.g. 08012345678"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-league-primary focus:outline-none focus:ring-1 focus:ring-league-primary"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Year of Birth</label>
          <input
            type="number"
            required
            min={1940}
            max={2015}
            value={form.birthYear}
            onChange={(e) => setForm({ ...form, birthYear: e.target.value })}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-league-primary focus:outline-none focus:ring-1 focus:ring-league-primary"
            placeholder="Used for account recovery only"
          />
          <p className="mt-1 text-xs text-slate-400">
            Collected only for account recovery. Not shown publicly.
          </p>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-league-primary py-2.5 text-sm font-semibold text-white hover:bg-league-secondary disabled:opacity-60"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
        <p className="text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link href="/login" className="text-league-primary hover:underline">
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}
