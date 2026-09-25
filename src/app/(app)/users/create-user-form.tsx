"use client";

import { useActionState, useRef, useEffect } from "react";
import { createUserAction } from "@/actions/user-actions";
import type { ActionState } from "@/actions/action-state";

export function CreateUserForm() {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    createUserAction,
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
      <div>
        <label className="block text-sm font-medium text-slate-700">Name</label>
        <input
          name="name"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Username</label>
        <input
          name="username"
          required
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input
          type="password"
          name="password"
          required
          minLength={6}
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Role</label>
        <select
          name="role"
          defaultValue="WORKER"
          className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-base"
        >
          <option value="WORKER">Worker — daily entry only</option>
          <option value="MANAGER">Manager — plus flocks &amp; status</option>
          <option value="OWNER">Owner — full access</option>
        </select>
      </div>
      {state && "error" in state && (
        <p className="sm:col-span-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      )}
      {state && "success" in state && (
        <p className="sm:col-span-2 rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          User created.
        </p>
      )}
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Add user"}
        </button>
      </div>
    </form>
  );
}
