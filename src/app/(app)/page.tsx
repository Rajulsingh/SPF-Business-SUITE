import Link from "next/link";
import { prisma } from "@/lib/db";
import { StatTile } from "@/components/stat-tile";
import { TrendChart } from "./trend-chart";

const TREND_DAYS = 30;
const MORTALITY_COLOR = "#e34948";
const EGG_COLOR = "#2a78d6";

function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

function shortLabel(key: string) {
  const d = new Date(`${key}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-IN", { month: "short", day: "numeric" }).format(d);
}

export default async function DashboardPage() {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - (TREND_DAYS - 1));

  const [activeFlocks, records, todayRecords] = await Promise.all([
    prisma.flock.findMany({ where: { status: "ACTIVE" } }),
    prisma.dailyRecord.findMany({
      where: { date: { gte: since } },
      select: { date: true, mortalityCount: true, eggCount: true },
    }),
    (() => {
      const todayStart = new Date();
      todayStart.setUTCHours(0, 0, 0, 0);
      return prisma.dailyRecord.findMany({
        where: { date: todayStart },
        select: { mortalityCount: true, eggCount: true },
      });
    })(),
  ]);

  const byDay = new Map<string, { mortality: number; eggs: number }>();
  for (let i = 0; i < TREND_DAYS; i++) {
    const d = new Date(since);
    d.setUTCDate(since.getUTCDate() + i);
    byDay.set(dayKey(d), { mortality: 0, eggs: 0 });
  }
  for (const r of records) {
    const key = dayKey(r.date);
    const bucket = byDay.get(key);
    if (!bucket) continue;
    bucket.mortality += r.mortalityCount;
    bucket.eggs += r.eggCount ?? 0;
  }

  const mortalitySeries = Array.from(byDay.entries()).map(([key, v]) => ({
    date: shortLabel(key),
    value: v.mortality,
  }));
  const eggSeries = Array.from(byDay.entries()).map(([key, v]) => ({
    date: shortLabel(key),
    value: v.eggs,
  }));

  const totalBirds = activeFlocks.reduce((sum, f) => sum + f.initialCount, 0);
  const mortalityToday = todayRecords.reduce((sum, r) => sum + r.mortalityCount, 0);
  const eggsToday = todayRecords.reduce((sum, r) => sum + (r.eggCount ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500">Last {TREND_DAYS} days, across active flocks</p>
        </div>
        <Link
          href="/daily-log"
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Log today&apos;s entry
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Active flocks" value={activeFlocks.length.toString()} />
        <StatTile label="Birds (initial count)" value={totalBirds.toLocaleString()} />
        <StatTile label="Mortality today" value={mortalityToday.toString()} />
        <StatTile label="Eggs today" value={eggsToday.toLocaleString()} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Mortality trend</h2>
          <p className="text-xs text-slate-500">Total birds lost per day, all active flocks</p>
          <div className="mt-2">
            <TrendChart data={mortalitySeries} color={MORTALITY_COLOR} unit="birds" />
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">Egg production trend</h2>
          <p className="text-xs text-slate-500">Total eggs collected per day, all active flocks</p>
          <div className="mt-2">
            <TrendChart data={eggSeries} color={EGG_COLOR} unit="eggs" />
          </div>
        </div>
      </div>

      {activeFlocks.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          No active flocks yet.{" "}
          <Link href="/flocks" className="text-emerald-700 hover:underline">
            Add your first flock
          </Link>{" "}
          to start tracking.
        </div>
      )}
    </div>
  );
}
