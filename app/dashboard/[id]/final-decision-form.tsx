"use client";

import { useActionState } from "react";
import {
  updateFinalDecision,
  type FinalDecisionState,
} from "./actions";

const initialState: FinalDecisionState = {
  success: false,
  message: "",
};

export default function FinalDecisionForm({
  applicantId,
  finalEmailSent,
}: {
  applicantId: string;
  finalEmailSent: boolean;
}) {
  const [state, formAction, pending] = useActionState(
    updateFinalDecision,
    initialState,
  );

  return (
    <form action={formAction} className="mt-6">
      <input type="hidden" name="applicantId" value={applicantId} />

      {finalEmailSent ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
          Final decision email has already been sent.
        </div>
      ) : null}

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
          value="accepted"
          disabled={pending || finalEmailSent}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-emerald-500 dark:text-zinc-950 dark:hover:bg-emerald-400"
        >
          {pending ? "Sending..." : "Accept Applicant"}
        </button>
        <button
          type="submit"
          name="decision"
          value="rejected"
          disabled={pending || finalEmailSent}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-lg border border-red-300 px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
        >
          {pending ? "Sending..." : "Reject Applicant"}
        </button>
      </div>
    </form>
  );
}
