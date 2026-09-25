"use client";

import { useActionState, useRef, useEffect } from "react";
import { createFlockAction } from "@/actions/flock-actions";
import type { ActionState } from "@/actions/action-state";
import { todayInputValue } from "@/lib/form-utils";

export function CreateFlockForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createFlockAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
    >
      <div>
        <label className="block text-sm font-medium text-slate-700">Flock name</label>
        <input
          name="name"
          required
          placeholder="e.g. Shed 3 — Batch A"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Breed / line</label>
        <input
          name="breed"
          placeholder="e.g. Vencobb"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Source / supplier</label>
        <input
          name="source"
          placeholder="Supplier name"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Housing type</label>
        <select
          name="housingType"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        >
          <option value="">Not specified</option>
          <option value="OPEN_SIDED">Open-sided</option>
          <option value="ENVIRONMENT_CONTROLLED">Environment-controlled</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Date placed</label>
        <input
          type="date"
          name="placedOn"
          required
          defaultValue={todayInputValue()}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Initial bird count</label>
        <input
          type="number"
          name="initialCount"
          min={1}
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-slate-700">Notes</label>
        <textarea
          name="notes"
          rows={2}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      {state && "error" in state && (
        <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p className="sm:col-span-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Flock created.
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add flock"}
        </button>
      </div>
    </form>
  );
}
