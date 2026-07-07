import Link from "next/link";

export default function ApplicantNotFound() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-8 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-3xl flex-1 items-center justify-center">
        <section className="w-full rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Applicant not found
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            This application could not be loaded.
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-zinc-600 dark:text-zinc-400">
            The applicant may have been removed, or the dashboard link may be
            incorrect.
          </p>
          <Link
            href="/dashboard"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg bg-zinc-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
          >
            Back to Dashboard
          </Link>
        </section>
      </main>
    </div>
  );
}
