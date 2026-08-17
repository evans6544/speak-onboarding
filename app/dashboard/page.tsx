import type { Metadata } from "next";
import Link from "next/link";
import { getApplicants } from "@/lib/applicants";
import ApplicantsTable from "./applicants-table";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | SPEAK Onboarding Portal",
  description: "Review SPEAK Lithuania onboarding applications",
};

export default async function DashboardPage() {
  const applicants = await getApplicants();

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-8 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              SPEAK Lithuania
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              CEO Dashboard
            </h1>
            <p className="mt-2 text-zinc-600 dark:text-zinc-400">
              Review submitted onboarding applications.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            Back to home
          </Link>
        </div>

        <ApplicantsTable applicants={applicants} />
      </main>
    </div>
  );
}
