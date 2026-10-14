export const metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 prose prose-slate">
      <h1 className="text-2xl font-bold">Privacy Notice</h1>
      <p className="text-sm text-slate-600">
        Ibeku League 2026 collects limited personal data to operate fan accounts
        and the competition platform.
      </p>
      <h2 className="mt-6 text-lg font-semibold">What we collect</h2>
      <ul className="list-disc pl-5 text-sm text-slate-600">
        <li>Username</li>
        <li>Phone number (for account identification and recovery)</li>
        <li>Year of birth (for account recovery only, never displayed publicly)</li>
        <li>Password (stored only as a secure one-way hash)</li>
      </ul>
      <h2 className="mt-6 text-lg font-semibold">What we do not do</h2>
      <ul className="list-disc pl-5 text-sm text-slate-600">
        <li>We do not sell personal data</li>
        <li>We do not display phone numbers or birth years publicly</li>
        <li>There is no payment, wallet or gambling functionality</li>
      </ul>
      <p className="mt-6 text-sm text-slate-500">
        Contact the league organisers for data access or deletion requests.
      </p>
    </div>
  );
}
