import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getSession, canManageFarm } from "@/lib/auth";
import { formatDate } from "@/lib/form-utils";
import { updateFlockStatusAction } from "@/actions/flock-actions";
import { StatTile } from "@/components/stat-tile";
import { WeightSampleForm } from "./weight-sample-form";
import { VaccinationForm } from "./vaccination-form";

export default async function FlockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getSession();

  const flock = await prisma.flock.findUnique({
    where: { id },
    include: {
      dailyRecords: { orderBy: { date: "desc" }, take: 14 },
      weightSamples: { orderBy: { date: "desc" }, take: 10 },
      vaccinations: { orderBy: { date: "desc" }, take: 10 },
    },
  });

  if (!flock) notFound();

  const ageInDays = daysSince(flock.placedOn);
  const canManage = session ? canManageFarm(session.role) : false;

  const last14 = flock.dailyRecords;
  const totalMortality14d = last14.reduce((sum, r) => sum + r.mortalityCount, 0);
  const currentCount = flock.initialCount - (await sumAllMortality(flock.id));

  return (
    <div className="space-y-8">
      <div>
        <Link href="/flocks" className="text-sm text-emerald-700 hover:underline">
          ← All flocks
        </Link>
        <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">{flock.name}</h1>
            <p className="text-sm text-slate-500">
              {flock.breed ?? "Breed not set"} · placed {formatDate(flock.placedOn)} (
              {ageInDays} days ago) · source: {flock.source ?? "not set"}
            </p>
          </div>
          {canManage && flock.status === "ACTIVE" && (
            <form action={updateFlockStatusAction.bind(null, flock.id, "ARCHIVED")}>
              <button
                type="submit"
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
              >
                Archive flock
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Initial count" value={flock.initialCount.toLocaleString()} />
        <StatTile label="Estimated current count" value={currentCount.toLocaleString()} />
        <StatTile label="Mortality, last 14 entries" value={totalMortality14d.toLocaleString()} />
        <StatTile label="Status" value={flock.status} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
          Recent daily records
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Mortality</th>
                <th className="px-4 py-2">Eggs</th>
                <th className="px-4 py-2">Feed (kg)</th>
                <th className="px-4 py-2">Water (L)</th>
                <th className="px-4 py-2">Temp °C</th>
                <th className="px-4 py-2">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {last14.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-slate-700">{formatDate(r.date)}</td>
                  <td className="px-4 py-2 text-slate-700">{r.mortalityCount}</td>
                  <td className="px-4 py-2 text-slate-700">{r.eggCount ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-700">{r.feedConsumedKg ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-700">{r.waterConsumedLiters ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-700">{r.tempC ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-500">{r.notes ?? "—"}</td>
                </tr>
              ))}
              {last14.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                    No daily records yet.{" "}
                    <Link href="/daily-log" className="text-emerald-700 hover:underline">
                      Log today&apos;s entry
                    </Link>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">
          Body-weight uniformity samples
        </h2>
        <div className="mb-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Age (wk)</th>
                <th className="px-3 py-2">n</th>
                <th className="px-3 py-2">Avg (g)</th>
                <th className="px-3 py-2">CV %</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flock.weightSamples.map((s) => {
                const flagged = s.cvPercent != null && s.cvPercent > s.targetCvPercent;
                return (
                  <tr key={s.id}>
                    <td className="px-3 py-2 text-slate-700">{formatDate(s.date)}</td>
                    <td className="px-3 py-2 text-slate-700">{s.ageWeeks ?? "—"}</td>
                    <td className="px-3 py-2 text-slate-700">{s.sampleSize}</td>
                    <td className="px-3 py-2 text-slate-700">{s.avgWeightG.toFixed(1)}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {s.cvPercent != null ? s.cvPercent.toFixed(1) : "—"}
                    </td>
                    <td className="px-3 py-2">
                      {s.cvPercent == null ? (
                        "—"
                      ) : flagged ? (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                          Above target ({s.targetCvPercent}%)
                        </span>
                      ) : (
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                          Within target
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {flock.weightSamples.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-6 text-center text-slate-400">
                    No weight samples recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <WeightSampleForm flockId={flock.id} />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Vaccination log</h2>
        <div className="mb-4 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Date</th>
                <th className="px-3 py-2">Vaccine</th>
                <th className="px-3 py-2">Method</th>
                <th className="px-3 py-2">Batch</th>
                <th className="px-3 py-2">By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {flock.vaccinations.map((v) => (
                <tr key={v.id}>
                  <td className="px-3 py-2 text-slate-700">{formatDate(v.date)}</td>
                  <td className="px-3 py-2 text-slate-700">{v.vaccineName}</td>
                  <td className="px-3 py-2 text-slate-700">{v.method ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-700">{v.batchNumber ?? "—"}</td>
                  <td className="px-3 py-2 text-slate-700">{v.administeredBy ?? "—"}</td>
                </tr>
              ))}
              {flock.vaccinations.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-3 py-6 text-center text-slate-400">
                    No vaccination records yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <VaccinationForm flockId={flock.id} />
      </section>
    </div>
  );
}

function daysSince(date: Date) {
  return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
}

async function sumAllMortality(flockId: string) {
  const result = await prisma.dailyRecord.aggregate({
    where: { flockId },
    _sum: { mortalityCount: true },
  });
  return result._sum.mortalityCount ?? 0;
}

