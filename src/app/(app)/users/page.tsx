import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { formatDate } from "@/lib/form-utils";
import { CreateUserForm } from "./create-user-form";

export default async function UsersPage() {
  const session = await getSession();
  if (!session || session.role !== "OWNER") {
    redirect("/");
  }

  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">
          Owners and managers can add flocks and change status; workers can only log
          daily entries and samples.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Username</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Added</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-4 py-2 text-slate-700">{u.name}</td>
                <td className="px-4 py-2 text-slate-700">{u.username}</td>
                <td className="px-4 py-2 text-slate-700">{u.role}</td>
                <td className="px-4 py-2 text-slate-500">{formatDate(u.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Add a user</h2>
        <CreateUserForm />
      </div>
    </div>
  );
}
