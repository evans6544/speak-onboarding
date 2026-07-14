import type { Metadata } from "next";
import Link from "next/link";
import { getApplicant } from "@/lib/applicants";
import TaskSubmissionForm from "./task-submission-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Submit Task | SPEAK Onboarding Portal",
  description: "Submit a SPEAK Lithuania onboarding assessment task",
};

type SubmitTaskPageProps = {
  searchParams: Promise<{ applicantId?: string | string[] }>;
};

function getApplicantId(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function MessageCard({
  title,
  message,
}: {
  title: string;
  message: string;
}) {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <main className="mx-auto flex w-full max-w-2xl flex-1 items-center justify-center">
        <section className="w-full rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {title}
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">{message}</p>
          <Link
            href="/"
            className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-zinc-300 px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            Back to home
          </Link>
        </section>
      </main>
    </div>
  );
}

export default async function SubmitTaskPage({
  searchParams,
}: SubmitTaskPageProps) {
  const applicantId = getApplicantId((await searchParams).applicantId);

  if (!applicantId) {
    return (
      <MessageCard
        title="Missing task link"
        message="This submission link is missing an applicant id."
      />
    );
  }

  const applicant = await getApplicant(applicantId);

  if (!applicant) {
    return (
      <MessageCard
        title="Task not found"
        message="We could not find an applicant for this task submission link."
      />
    );
  }

  if (!applicant.task) {
    return (
      <MessageCard
        title="No task assigned"
        message="There is no assessment task assigned to this applicant yet."
      />
    );
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-12 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-3xl">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            SPEAK Lithuania
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            Submit your assessment task
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            {applicant.full_name}, submit your completed task below.
          </p>

          {applicant.task_submitted ? (
            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
              We have received a task submission for this application.
            </div>
          ) : null}

          <div className="mt-8 rounded-lg border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
              Task and assessment
            </h2>
            <p className="mt-3 whitespace-pre-wrap text-zinc-800 dark:text-zinc-200">
              {applicant.task}
            </p>
          </div>

          <TaskSubmissionForm
            applicantId={applicant.id}
            defaultSubmissionLink={applicant.submission_link}
            defaultComments={applicant.submission_comments}
          />
        </section>
      </main>
    </div>
  );
}
