"use client";

import { useActionState, useRef, useEffect } from "react";
import { createVaccinationAction } from "@/actions/vaccination-actions";
import type { ActionState } from "@/actions/action-state";
import { todayInputValue } from "@/lib/form-utils";

export function VaccinationForm({ flockId }: { flockId: string }) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createVaccinationAction,
    null
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state && "success" in state) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <input type="hidden" name="flockId" value={flockId} />
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
        <label className="block text-sm font-medium text-slate-700">Vaccine name</label>
        <input
          name="vaccineName"
          required
          placeholder="e.g. HVT + Rispens (Marek's)"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Method</label>
        <select
          name="method"
          defaultValue=""
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        >
          <option value="">Not specified</option>
          <option value="IN_OVO">In-ovo</option>
          <option value="SPRAY">Spray</option>
          <option value="DRINKING_WATER">Drinking water</option>
          <option value="INJECTION">Injection</option>
          <option value="EYE_DROP">Eye drop</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Batch number</label>
        <input
          name="batchNumber"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Administered by</label>
        <input
          name="administeredBy"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Notes</label>
        <input
          name="notes"
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
          Vaccination recorded.
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add vaccination record"}
        </button>
      </div>
    </form>
  );
}
