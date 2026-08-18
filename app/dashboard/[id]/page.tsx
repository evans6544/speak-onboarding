import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getApplicant, type Applicant } from "@/lib/applicants";
import { isCeoAuthenticated, requireCeoSession } from "@/lib/ceo-auth";
import FinalDecisionForm from "./final-decision-form";
import Stage1ReviewForm from "./stage1-review-form";

export const dynamic = "force-dynamic";

type ApplicantDetailPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: ApplicantDetailPageProps): Promise<Metadata> {
  if (!(await isCeoAuthenticated())) {
    return { title: "CEO Login | SPEAK Dashboard" };
  }

  const { id } = await params;
  const applicant = await getApplicant(id);

  return {
    title: applicant
      ? `${applicant.full_name} | SPEAK Dashboard`
      : "Applicant Not Found | SPEAK Dashboard",
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/Vilnius",
  }).format(new Date(value));
}

function formatOptionalDate(value: string | null) {
  return value ? formatDate(value) : null;
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-zinc-200 py-4 last:border-b-0 dark:border-zinc-800">
      <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
        {label}
      </dt>
      <dd className="mt-1 text-base text-zinc-900 dark:text-zinc-50">
        {value || "Not provided"}
      </dd>
    </div>
  );
}

function ExternalLink({ href }: { href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="break-all font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-zinc-600 dark:text-zinc-50 dark:decoration-zinc-600 dark:hover:text-zinc-300"
    >
      {href}
    </a>
  );
}

function TaskSubmissionPageLink({ applicantId }: { applicantId: string }) {
  const href = `/submit-task?applicantId=${encodeURIComponent(applicantId)}`;

  return (
    <Link
      href={href}
      className="break-all font-medium text-zinc-900 underline decoration-zinc-400 underline-offset-4 transition-colors hover:text-zinc-600 dark:text-zinc-50 dark:decoration-zinc-600 dark:hover:text-zinc-300"
    >
      {href}
    </Link>
  );
}

function DecisionBadge({
  value,
}: {
  value: Applicant["stage1_decision"] | Applicant["final_decision"];
}) {
  const className =
    value === "accepted"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
      : value === "selected"
        ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200"
      : value === "rejected"
        ? "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200";

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${className}`}
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
          : "border-zinc-200 bg-zinc-50 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
      }`}
    >
      {value ? "Yes" : "No"}
    </span>
  );
}

export default async function ApplicantDetailPage({
  params,
}: ApplicantDetailPageProps) {
  await requireCeoSession();
  const { id } = await params;
  const applicant = await getApplicant(id);

  if (!applicant) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-50 px-6 py-8 dark:bg-zinc-950">
      <main className="mx-auto w-full max-w-3xl">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <span aria-hidden="true">{"<-"}</span>
          Back to Dashboard
        </Link>

        <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
          <div className="flex flex-col gap-4 border-b border-zinc-200 pb-6 dark:border-zinc-800 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Applicant Details
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                {applicant.full_name}
              </h1>
              <p className="mt-2 text-zinc-600 dark:text-zinc-400">
                Submitted {formatDate(applicant.created_at)}
              </p>
            </div>
            <DecisionBadge value={applicant.stage1_decision} />
          </div>

          <dl className="mt-2">
            <Field label="Full Name" value={applicant.full_name} />
            <Field label="Email" value={applicant.email} />
            <Field label="Contact Number" value={applicant.phone_number} />
            <Field label="Position" value={applicant.position} />
            <Field label="Social Media" value={applicant.social_media} />
            <Field
              label="Current Occupation"
              value={applicant.current_occupation}
            />
            <Field
              label="Introduction Video"
              value={
                applicant.introduction_video_url ? (
                  <ExternalLink href={applicant.introduction_video_url} />
                ) : null
              }
            />
            <Field
              label="Application Comment"
              value={applicant.application_comment}
            />
            <Field
              label="Stage 1 Decision"
              value={<DecisionBadge value={applicant.stage1_decision} />}
            />
            <Field label="Task" value={applicant.task} />
            <Field
              label="Task Sent"
              value={<BooleanBadge value={applicant.task_sent} />}
            />
            <Field
              label="Task Submission Page"
              value={<TaskSubmissionPageLink applicantId={applicant.id} />}
            />
            <Field
              label="Task Submitted"
              value={<BooleanBadge value={applicant.task_submitted} />}
            />
            <Field
              label="Task Submitted At"
              value={formatOptionalDate(applicant.task_submitted_at)}
            />
            <Field
              label="Submitted Task Link"
              value={
                applicant.submission_link ? (
                  <ExternalLink href={applicant.submission_link} />
                ) : null
              }
            />
            <Field
              label="Submission Comments"
              value={applicant.submission_comments}
            />
            <Field
              label="Final Decision"
              value={<DecisionBadge value={applicant.final_decision} />}
            />
            <Field
              label="Final Email Sent"
              value={<BooleanBadge value={applicant.final_email_sent} />}
            />
            <Field label="Created At" value={formatDate(applicant.created_at)} />
          </dl>
        </section>

        {applicant.task_submitted ? (
          <section className="mt-8 rounded-lg border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:p-8">
            <div className="border-b border-zinc-200 pb-6 dark:border-zinc-800">
              <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                Final Decision
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Review submitted task
              </h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                Review the applicant&apos;s submitted work before sending the
                final decision email.
              </p>
            </div>

            <dl className="mt-2">
              <Field
                label="Submission Link"
                value={
                  applicant.submission_link ? (
                    <ExternalLink href={applicant.submission_link} />
                  ) : null
                }
              />
              <Field
                label="Submission Comments"
                value={applicant.submission_comments}
              />
              <Field
                label="Submitted At"
                value={formatOptionalDate(applicant.task_submitted_at)}
              />
            </dl>

            <FinalDecisionForm
              applicantId={applicant.id}
              finalEmailSent={applicant.final_email_sent}
            />
          </section>
        ) : null}

        <Stage1ReviewForm
          applicantId={applicant.id}
          defaultTask={applicant.task}
        />
      </main>
    </div>
  );
}
