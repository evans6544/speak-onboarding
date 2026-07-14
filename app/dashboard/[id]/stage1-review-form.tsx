"use client";

import { useActionState } from "react";
import {
  updateStage1Decision,
  type Stage1ReviewState,
} from "./actions";

const initialState: Stage1ReviewState = {
  success: false,
  message: "",
};

export default function Stage1ReviewForm({
  applicantId,
  defaultTask,
}: {
  applicantId: string;
  defaultTask: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateStage1Decision,
    initialState,
  );

  return (
    <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
          Stage 1 Review
        </p>
        <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Decision and task
        </h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
          Add the task and assessment notes before selecting an applicant for
          the next stage. Selecting sends the task email; rejecting sends the
          rejection email.
        </p>
      </div>

      <form action={formAction} className="mt-6">
        <input type="hidden" name="applicantId" value={applicantId} />

        <label
          htmlFor="task"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Task and assessment
        </label>
        <textarea
          id="task"
          name="task"
          rows={7}
          defaultValue={defaultTask ?? ""}
          placeholder="Write the next-stage task and any assessment notes here."
          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
        />

        {state.message ? (
          <div
            role="status"
            className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
              state.success
                ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
                : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            name="decision"
            value="selected"
            disabled={pending}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
          >
            {pending ? "Saving..." : "Select for Next Stage"}
          </button>
          <button
            type="submit"
            name="decision"
            value="rejected"
            disabled={pending}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-red-300 px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
          >
            {pending ? "Saving..." : "Reject Application"}
          </button>
        </div>
      </form>
    </section>
  );
}
