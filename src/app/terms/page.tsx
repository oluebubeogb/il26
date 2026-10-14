export const metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-bold">Terms of Use</h1>
      <div className="mt-4 space-y-4 text-sm text-slate-600">
        <p>
          Ibeku League 2026 is an official competition platform for fixtures,
          results, standings and fan engagement.
        </p>
        <p>
          <strong>Predictions (when available)</strong> are for entertainment
          only. No money, stakes, deposits or prizes are involved through this
          platform.
        </p>
        <p>
          Users must provide accurate registration details and keep their
          password secure. Abusive content may be moderated or removed.
        </p>
        <p>
          The organisers reserve the right to correct match results, standings
          and fixture information. The sponsor does not administer the platform
          unless explicitly configured to do so.
        </p>
      </div>
    </div>
  );
}
