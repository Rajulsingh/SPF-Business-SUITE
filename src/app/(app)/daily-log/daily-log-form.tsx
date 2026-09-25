"use client";

import { useActionState, useMemo, useState } from "react";
import { upsertDailyRecordAction } from "@/actions/daily-record-actions";
import type { ActionState } from "@/actions/action-state";
import { todayInputValue } from "@/lib/form-utils";

type FlockOption = { id: string; name: string };

export type TodayRecordValues = {
  mortalityCount: number;
  mortalityCause: string;
  eggCount: string;
  feedConsumedKg: string;
  waterConsumedLiters: string;
  tempC: string;
  humidityPct: string;
  notes: string;
};

const BLANK: TodayRecordValues = {
  mortalityCount: 0,
  mortalityCause: "",
  eggCount: "",
  feedConsumedKg: "",
  waterConsumedLiters: "",
  tempC: "",
  humidityPct: "",
  notes: "",
};

export function DailyLogForm({
  flocks,
  todayByFlockId,
}: {
  flocks: FlockOption[];
  todayByFlockId: Record<string, TodayRecordValues>;
}) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    upsertDailyRecordAction,
    null
  );
  const [flockId, setFlockId] = useState(flocks[0]?.id ?? "");
  const [values, setValues] = useState<TodayRecordValues>(
    () => todayByFlockId[flocks[0]?.id ?? ""] ?? BLANK
  );

  const hasExistingEntry = useMemo(
    () => Boolean(todayByFlockId[flockId]),
    [flockId, todayByFlockId]
  );

  function handleFlockChange(nextFlockId: string) {
    setFlockId(nextFlockId);
    setValues(todayByFlockId[nextFlockId] ?? BLANK);
  }

  function update<K extends keyof TodayRecordValues>(key: K, value: TodayRecordValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  if (flocks.length === 0) {
    return (
      <p className="rounded-md bg-slate-100 px-3 py-2 text-sm text-slate-600">
        No active flocks yet. Add one on the Flocks page first.
      </p>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Flock</label>
          <select
            name="flockId"
            required
            value={flockId}
            onChange={(e) => handleFlockChange(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          >
            {flocks.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Date</label>
          <input
            type="date"
            name="date"
            required
            defaultValue={todayInputValue()}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          />
        </div>
      </div>

      {hasExistingEntry && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-700">
          This flock already has an entry for today — the fields below are pre-filled
          with it. Saving will update that entry, not create a duplicate.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Mortality</label>
          <input
            type="number"
            name="mortalityCount"
            min={0}
            value={values.mortalityCount}
            onChange={(e) => update("mortalityCount", Number(e.target.value))}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Eggs collected</label>
          <input
            type="number"
            name="eggCount"
            min={0}
            value={values.eggCount}
            onChange={(e) => update("eggCount", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Feed (kg)</label>
          <input
            type="number"
            name="feedConsumedKg"
            step="0.1"
            min={0}
            value={values.feedConsumedKg}
            onChange={(e) => update("feedConsumedKg", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Water (L)</label>
          <input
            type="number"
            name="waterConsumedLiters"
            step="0.1"
            min={0}
            value={values.waterConsumedLiters}
            onChange={(e) => update("waterConsumedLiters", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Temp °C</label>
          <input
            type="number"
            name="tempC"
            step="0.1"
            value={values.tempC}
            onChange={(e) => update("tempC", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Humidity %</label>
          <input
            type="number"
            name="humidityPct"
            step="0.1"
            value={values.humidityPct}
            onChange={(e) => update("humidityPct", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Mortality cause (if any)
          </label>
          <input
            name="mortalityCause"
            value={values.mortalityCause}
            onChange={(e) => update("mortalityCause", e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          name="notes"
          rows={2}
          value={values.notes}
          onChange={(e) => update("notes", e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>

      {state && "error" in state && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
      )}
      {state && "success" in state && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-emerald-700 px-4 py-3 text-base font-medium text-white hover:bg-emerald-800 disabled:opacity-60 sm:w-auto"
      >
        {pending ? "Saving…" : "Save today's entry"}
      </button>
    </form>
  );
}
