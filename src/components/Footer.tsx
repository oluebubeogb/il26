import Link from "next/link";

const SPONSOR =
  "Ibeku League 2026 is sponsored by High Chief Dickson Oguguo Nzenwa Aku Bara-Oha 1 Of Ibeku Ancient Kingdom.";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-center text-sm text-amber-900">
          <p className="font-medium">{SPONSOR}</p>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="text-center text-sm text-slate-500 sm:text-left">
            <p className="font-semibold text-slate-700">Ibeku League 2026</p>
            <p>11 Oct 2026 – 3 Jan 2027 · Africa/Lagos</p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <Link href="/privacy" className="hover:text-slate-800">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-slate-800">
              Terms
            </Link>
            <Link href="/fixtures" className="hover:text-slate-800">
              Fixtures
            </Link>
            <Link href="/groups" className="hover:text-slate-800">
              Groups
            </Link>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Ibeku League. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
