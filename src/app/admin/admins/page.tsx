import { prisma } from "@/lib/prisma";
import { requirePrimaryAdmin, hashPassword, audit, normalizeUsername, normalizePhone } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

async function createAdmin(formData: FormData) {
  "use server";
  const actor = await requirePrimaryAdmin();
  const username = (formData.get("username") as string)?.trim();
  const phone = (formData.get("phone") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || !phone || !password || password.length < 8) return;

  const normalizedUsername = normalizeUsername(username);
  const normalizedPhone = normalizePhone(phone);

  const exists = await prisma.user.findFirst({
    where: {
      OR: [{ normalizedUsername }, { normalizedPhone }],
    },
  });
  if (exists) return;

  const passwordHash = await hashPassword(password);
  const admin = await prisma.user.create({
    data: {
      username,
      normalizedUsername,
      phone,
      normalizedPhone,
      passwordHash,
      birthYear: 1980,
      role: "ADMIN",
    },
  });

  await audit(actor.id, "ADMIN_CREATE", "User", admin.id, { username });
  revalidatePath("/admin/admins");
}

async function resetAdminPassword(formData: FormData) {
  "use server";
  const actor = await requirePrimaryAdmin();
  const adminId = formData.get("adminId") as string;
  const password = formData.get("password") as string;
  if (!adminId || !password || password.length < 8) return;

  const target = await prisma.user.findUnique({ where: { id: adminId } });
  if (!target || target.role !== "ADMIN") return;

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: adminId },
    data: { passwordHash },
  });
  await audit(actor.id, "ADMIN_PASSWORD_RESET", "User", adminId);
  revalidatePath("/admin/admins");
}

async function toggleAdmin(formData: FormData) {
  "use server";
  const actor = await requirePrimaryAdmin();
  const adminId = formData.get("adminId") as string;
  const target = await prisma.user.findUnique({ where: { id: adminId } });
  if (!target || target.role !== "ADMIN") return;

  const newStatus = target.status === "active" ? "disabled" : "active";
  await prisma.user.update({
    where: { id: adminId },
    data: { status: newStatus },
  });
  await audit(actor.id, "ADMIN_TOGGLE", "User", adminId, { newStatus });
  revalidatePath("/admin/admins");
}

export default async function AdminAdminsPage() {
  await requirePrimaryAdmin();
  const admins = await prisma.user.findMany({
    where: { role: { in: ["ADMIN", "PRIMARY_ADMIN"] } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Admin Management</h2>
      <p className="mb-6 text-sm text-slate-500">
        Only the primary admin can create, disable or reset other admins.
      </p>

      <form action={createAdmin} className="card mb-8 max-w-md space-y-3 p-4">
        <h3 className="font-medium">Create Secondary Admin</h3>
        <input
          name="username"
          required
          placeholder="Username"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="phone"
          required
          placeholder="Phone"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          name="password"
          type="password"
          required
          minLength={8}
          placeholder="Password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-league-primary px-4 py-2 text-sm font-semibold text-white"
        >
          Create Admin
        </button>
      </form>

      <div className="card divide-y divide-slate-100">
        {admins.map((a) => (
          <div key={a.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div>
              <p className="font-medium">
                {a.username}{" "}
                <span className="text-xs text-slate-400">({a.role})</span>
              </p>
              <p className="text-xs text-slate-400">
                {a.phone} · {a.status}
              </p>
            </div>
            {a.role === "ADMIN" && (
              <div className="flex flex-wrap gap-2">
                <form action={toggleAdmin} className="inline">
                  <input type="hidden" name="adminId" value={a.id} />
                  <button
                    type="submit"
                    className="rounded border border-slate-300 px-2 py-1 text-xs"
                  >
                    {a.status === "active" ? "Disable" : "Enable"}
                  </button>
                </form>
                <form action={resetAdminPassword} className="inline-flex gap-1">
                  <input type="hidden" name="adminId" value={a.id} />
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    placeholder="New password"
                    className="w-32 rounded border border-slate-300 px-2 py-1 text-xs"
                  />
                  <button
                    type="submit"
                    className="rounded bg-slate-800 px-2 py-1 text-xs text-white"
                  >
                    Reset
                  </button>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
