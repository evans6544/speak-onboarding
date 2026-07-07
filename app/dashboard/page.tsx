import type { Metadata } from "next";
import Link from "next/link";
import { getApplicants, type Applicant } from "@/lib/applicants";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard | SPEAK Onboarding Portal",
  description: "Review SPEAK Lithuania onboarding applications",
};

const tableHeadClassName =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400";

const tableCellClassName =
  "whitespace-nowrap px-4 py-4 text-sm text-zinc-700 dark:text-zinc-300";

type DecisionValue = Applicant["stage1_decision"] | Applicant["final_decision"];

const decisionStyles: Record<DecisionValue, string> = {
  pending:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200",
  selected:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  approved:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200",
  rejected:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Vilnius",
  }).format(new Date(value));
}

function DecisionBadge({ value }: { value: DecisionValue }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${decisionStyles[value]}`}
    >
      {value}
    </span>
  );
}

function BooleanBadge({ value }: { value: boolean }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        value
          ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
          : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

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

        <section className="mt-8 overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
            <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {applicants.length} applicant
              {applicants.length === 1 ? "" : "s"}
            </p>
          </div>

          {applicants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-950">
                  <tr>
                    <th className={tableHeadClassName}>Full Name</th>
                    <th className={tableHeadClassName}>Email</th>
                    <th className={tableHeadClassName}>Position</th>
                    <th className={tableHeadClassName}>Current Occupation</th>
                    <th className={tableHeadClassName}>Stage 1 Decision</th>
                    <th className={tableHeadClassName}>Task Sent</th>
                    <th className={tableHeadClassName}>Final Decision</th>
                    <th className={tableHeadClassName}>Created At</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {applicants.map((applicant) => (
                    <tr
                      key={applicant.id}
                      className="transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/60"
                    >
                      <td className={`${tableCellClassName} font-medium`}>
                        {applicant.full_name}
                      </td>
                      <td className={tableCellClassName}>{applicant.email}</td>
                      <td className={tableCellClassName}>
                        {applicant.position}
                      </td>
                      <td className={tableCellClassName}>
                        {applicant.current_occupation}
                      </td>
                      <td className={tableCellClassName}>
                        <DecisionBadge value={applicant.stage1_decision} />
                      </td>
                      <td className={tableCellClassName}>
                        <BooleanBadge value={applicant.task_sent} />
                      </td>
                      <td className={tableCellClassName}>
                        <DecisionBadge value={applicant.final_decision} />
                      </td>
                      <td className={tableCellClassName}>
                        {formatDate(applicant.created_at)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm">
                        <Link
                          href={`/dashboard/${applicant.id}`}
                          className="inline-flex h-9 items-center justify-center rounded-lg bg-zinc-900 px-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="px-5 py-16 text-center">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                No applicants yet
              </h2>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                New submissions from the apply form will appear here.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
