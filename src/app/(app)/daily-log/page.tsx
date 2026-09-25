import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/form-utils";
import { DailyLogForm, type TodayRecordValues } from "./daily-log-form";

export default async function DailyLogPage() {
  const flocks = await prisma.flock.findMany({
    where: { status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const todayStart = new Date();
  todayStart.setUTCHours(0, 0, 0, 0);

  const todayRecords = await prisma.dailyRecord.findMany({
    where: { date: todayStart },
    include: { flock: { select: { name: true } }, recordedBy: { select: { name: true } } },
  });

  const todayByFlockId: Record<string, TodayRecordValues> = {};
  for (const r of todayRecords) {
    todayByFlockId[r.flockId] = {
      mortalityCount: r.mortalityCount,
      mortalityCause: r.mortalityCause ?? "",
      eggCount: r.eggCount?.toString() ?? "",
      feedConsumedKg: r.feedConsumedKg?.toString() ?? "",
      waterConsumedLiters: r.waterConsumedLiters?.toString() ?? "",
      tempC: r.tempC?.toString() ?? "",
      humidityPct: r.humidityPct?.toString() ?? "",
      notes: r.notes ?? "",
    };
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Daily log</h1>
        <p className="text-sm text-slate-500">
          Quick entry for today&apos;s mortality, eggs, feed, water, and environment
          readings — the foundation everything else (uniformity tracking, alerting,
          trend charts) is built on. Logging the same flock again today updates that
          entry instead of duplicating it, and pre-fills with what&apos;s already saved.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <DailyLogForm flocks={flocks} todayByFlockId={todayByFlockId} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white">
        <h2 className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-900">
          Logged today ({formatDate(todayStart)})
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2">Flock</th>
                <th className="px-4 py-2">Mortality</th>
                <th className="px-4 py-2">Eggs</th>
                <th className="px-4 py-2">Feed (kg)</th>
                <th className="px-4 py-2">Logged by</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {todayRecords.map((r) => (
                <tr key={r.id}>
                  <td className="px-4 py-2 text-slate-700">{r.flock.name}</td>
                  <td className="px-4 py-2 text-slate-700">{r.mortalityCount}</td>
                  <td className="px-4 py-2 text-slate-700">{r.eggCount ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-700">{r.feedConsumedKg ?? "—"}</td>
                  <td className="px-4 py-2 text-slate-500">{r.recordedBy?.name ?? "—"}</td>
                </tr>
              ))}
              {todayRecords.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    No entries yet today.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
