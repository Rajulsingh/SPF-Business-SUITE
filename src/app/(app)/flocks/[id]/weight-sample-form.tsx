"use client";

import { useActionState, useRef, useEffect } from "react";
import { createWeightSampleAction } from "@/actions/weight-sample-actions";
import type { ActionState } from "@/actions/action-state";
import { todayInputValue } from "@/lib/form-utils";

export function WeightSampleForm({ flockId }: { flockId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createWeightSampleAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      <input type="hidden" name="flockId" value={flockId} />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
        <div>
          <label className="block text-sm font-medium text-slate-700">Age (weeks)</label>
          <input
            type="number"
            name="ageWeeks"
            min={0}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-slate-700">
            Target CV band (%)
          </label>
          <input
            type="number"
            name="targetCvPercent"
            step="0.1"
            defaultValue={12}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
          />
          <p className="mt-1 text-xs text-slate-400">
            Good-practice target is ~10–12% CV; samples above this are flagged.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700">
          Individual sample weights (grams)
        </label>
        <textarea
          name="rawWeightsG"
          rows={3}
          placeholder="e.g. 1820, 1795, 1910, 1780, 1860 …"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
        <p className="mt-1 text-xs text-slate-400">
          Separate weights with commas, spaces, or new lines. Average, spread, and CV%
          are computed automatically from this list.
        </p>
      </div>

      <details className="rounded-md border border-slate-200 px-3 py-2 text-sm">
        <summary className="cursor-pointer font-medium text-slate-700">
          Or enter a pre-computed average instead
        </summary>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Sample size
            </label>
            <input
              type="number"
              name="sampleSize"
              min={1}
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">
              Average weight (g)
            </label>
            <input
              type="number"
              name="avgWeightG"
              step="0.1"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600">CV (%)</label>
            <input
              type="number"
              name="cvPercent"
              step="0.1"
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-1.5 text-sm"
            />
          </div>
        </div>
      </details>

      <div>
        <label className="block text-sm font-medium text-slate-700">Notes</label>
        <input
          name="notes"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>

      {state && "error" in state && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Weight sample saved.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save weight sample"}
      </button>
    </form>
  );
}
