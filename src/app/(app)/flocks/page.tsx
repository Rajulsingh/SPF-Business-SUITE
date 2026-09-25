import Link from "next/link";
import { prisma } from "@/lib/db";
import { getSession, canManageFarm } from "@/lib/auth";
import { formatDate } from "@/lib/form-utils";
import { CreateFlockForm } from "./create-flock-form";

export default async function FlocksPage() {
  const session = await getSession();
  const flocks = await prisma.flock.findMany({
    orderBy: { placedOn: "desc" },
    include: { _count: { select: { dailyRecords: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Flocks</h1>
        <p className="text-sm text-slate-500">
          Each flock is a tracked batch — its own daily records, weight samples, and
          vaccinations.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Breed</th>
              <th className="px-4 py-2">Placed on</th>
              <th className="px-4 py-2">Birds</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Records</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {flocks.map((flock) => (
              <tr key={flock.id} className="hover:bg-slate-50">
                <td className="px-4 py-2">
                  <Link
                    href={`/flocks/${flock.id}`}
                    className="font-medium text-emerald-700 hover:underline"
                  >
                    {flock.name}
                  </Link>
                </td>
                <td className="px-4 py-2 text-slate-600">{flock.breed ?? "—"}</td>
                <td className="px-4 py-2 text-slate-600">{formatDate(flock.placedOn)}</td>
                <td className="px-4 py-2 text-slate-600">{flock.initialCount}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      flock.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {flock.status}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-600">{flock._count.dailyRecords}</td>
              </tr>
            ))}
            {flocks.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  No flocks yet — add your first one below.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {session && canManageFarm(session.role) && (
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Add a flock</h2>
          <CreateFlockForm />
        </div>
      )}
    </div>
  );
}
