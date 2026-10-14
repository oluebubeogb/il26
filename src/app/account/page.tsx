import { redirect } from "next/navigation";
import { getCurrentUser, destroySession } from "@/lib/auth";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="mb-6 text-2xl font-bold">My Account</h1>
      <div className="card space-y-4 p-6">
        <div>
          <p className="text-sm text-slate-500">Username</p>
          <p className="font-medium">{user.username}</p>
        </div>
        <div>
          <p className="text-sm text-slate-500">Role</p>
          <p className="font-medium">{user.role}</p>
        </div>
        {(user.role === "ADMIN" || user.role === "PRIMARY_ADMIN") && (
          <Link
            href="/admin"
            className="block rounded-lg bg-league-primary py-2 text-center text-sm font-semibold text-white"
          >
            Go to Admin Console
          </Link>
        )}
        <form
          action={async () => {
            "use server";
            await destroySession();
            redirect("/");
          }}
        >
          <button
            type="submit"
            className="w-full rounded-lg border border-slate-300 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
