"use client";

import type { FormEvent } from "react";
import { useActionState } from "react";
import { submitTask, type TaskSubmissionState } from "./actions";
import { normalizeSubmissionUrl } from "./submission-url";

const initialState: TaskSubmissionState = {
  success: false,
  message: "",
};

export default function TaskSubmissionForm({
  applicantId,
  defaultSubmissionLink,
  defaultComments,
}: {
  applicantId: string;
  defaultSubmissionLink: string | null;
  defaultComments: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    submitTask,
    initialState,
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const submissionLinkInput = event.currentTarget.elements.namedItem(
      "submissionLink",
    );

    if (!(submissionLinkInput instanceof HTMLInputElement)) {
      event.preventDefault();
      return;
    }

    const result = normalizeSubmissionUrl(submissionLinkInput.value);

    if (!result.ok) {
      event.preventDefault();
      submissionLinkInput.setCustomValidity(result.error);
      submissionLinkInput.reportValidity();
      return;
    }

    submissionLinkInput.setCustomValidity("");
    submissionLinkInput.value = result.url;
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="mt-8 space-y-5">
      <input type="hidden" name="applicantId" value={applicantId} />

      <div>
        <label
          htmlFor="submissionLink"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Link to completed work
        </label>
        <input
          id="submissionLink"
          name="submissionLink"
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          required
          defaultValue={defaultSubmissionLink ?? ""}
          placeholder="Google Drive, OneDrive, GitHub, YouTube, or another webpage link"
          onInput={(event) => event.currentTarget.setCustomValidity("")}
          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
        />
      </div>

      <div>
        <label
          htmlFor="comments"
          className="block text-sm font-medium text-zinc-700 dark:text-zinc-300"
        >
          Comments
        </label>
        <textarea
          id="comments"
          name="comments"
          rows={5}
          defaultValue={defaultComments ?? ""}
          placeholder="Add anything the SPEAK team should know about your submission."
          className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400"
        />
      </div>

      {state.message ? (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
              : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {pending ? "Submitting..." : "Submit Task"}
      </button>
    </form>
  );
}
