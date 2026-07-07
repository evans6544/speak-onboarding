"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { submitApplication } from "./actions";
import {
  parseApplicationFormData,
  validateApplicationInput,
  type ApplicationFieldErrors,
} from "@/lib/application-validation";

const inputClassName =
  "mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-zinc-900 placeholder:text-zinc-400 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-zinc-400";

const inputErrorClassName =
  "border-red-500 focus:border-red-500 focus:ring-red-500/20 dark:border-red-500 dark:focus:border-red-400";

const labelClassName =
  "block text-sm font-medium text-zinc-700 dark:text-zinc-300";

const fieldErrorClassName = "mt-1.5 text-sm text-red-600 dark:text-red-400";

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className={fieldErrorClassName}>{message}</p>;
}

export default function ApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ApplicationFieldErrors>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});

    const form = event.currentTarget;
    const formData = new FormData(form);
    const validation = validateApplicationInput(
      parseApplicationFormData(formData),
    );

    if (!validation.ok) {
      setFieldErrors(validation.fieldErrors);
      setFormError("Please fix the errors below and try again.");
      return;
    }

    startTransition(async () => {
      const result = await submitApplication(formData);

      if (result.success) {
        form.reset();
        setSubmitted(true);
        return;
      }

      setFormError(result.error);
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      }
    });
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950">
          <svg
            className="h-7 w-7 text-emerald-600 dark:text-emerald-400"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12.75l6 6 9-13.5"
            />
          </svg>
        </div>
        <h2 className="mt-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
          Application submitted
        </h2>
        <p className="mt-3 text-zinc-600 dark:text-zinc-400">
          Thank you for applying to SPEAK Lithuania. We&apos;ll review your
          application and get back to you soon.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex h-11 items-center justify-center rounded-lg border border-zinc-300 px-6 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          Back to home
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8 dark:border-zinc-800 dark:bg-zinc-900"
    >
      {formError ? (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200"
        >
          {formError}
        </div>
      ) : null}

      <div className="space-y-5">
        <div>
          <label htmlFor="fullName" className={labelClassName}>
            Full Name
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Jane Doe"
            aria-invalid={Boolean(fieldErrors.fullName)}
            aria-describedby={
              fieldErrors.fullName ? "fullName-error" : undefined
            }
            className={`${inputClassName}${fieldErrors.fullName ? ` ${inputErrorClassName}` : ""}`}
          />
          <FieldError message={fieldErrors.fullName} />
        </div>

        <div>
          <label htmlFor="email" className={labelClassName}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="jane@example.com"
            aria-invalid={Boolean(fieldErrors.email)}
            aria-describedby={fieldErrors.email ? "email-error" : undefined}
            className={`${inputClassName}${fieldErrors.email ? ` ${inputErrorClassName}` : ""}`}
          />
          <FieldError message={fieldErrors.email} />
        </div>

        <div>
          <label htmlFor="position" className={labelClassName}>
            Position applying to
          </label>
          <input
            id="position"
            name="position"
            type="text"
            placeholder="e.g. Volunteer, Intern, Language Buddy"
            aria-invalid={Boolean(fieldErrors.position)}
            aria-describedby={
              fieldErrors.position ? "position-error" : undefined
            }
            className={`${inputClassName}${fieldErrors.position ? ` ${inputErrorClassName}` : ""}`}
          />
          <FieldError message={fieldErrors.position} />
        </div>

        <div>
          <label htmlFor="socialMedia" className={labelClassName}>
            Social Media Profiles
          </label>
          <textarea
            id="socialMedia"
            name="socialMedia"
            rows={3}
            placeholder="LinkedIn, Instagram, Facebook, etc."
            aria-invalid={Boolean(fieldErrors.socialMedia)}
            aria-describedby={
              fieldErrors.socialMedia ? "socialMedia-error" : undefined
            }
            className={`${inputClassName}${fieldErrors.socialMedia ? ` ${inputErrorClassName}` : ""}`}
          />
          <FieldError message={fieldErrors.socialMedia} />
        </div>

        <div>
          <label htmlFor="occupation" className={labelClassName}>
            Current Occupation / Status
          </label>
          <input
            id="occupation"
            name="occupation"
            type="text"
            placeholder="e.g. Student, Employed, Looking for opportunities"
            aria-invalid={Boolean(fieldErrors.currentOccupation)}
            aria-describedby={
              fieldErrors.currentOccupation ? "occupation-error" : undefined
            }
            className={`${inputClassName}${fieldErrors.currentOccupation ? ` ${inputErrorClassName}` : ""}`}
          />
          <FieldError message={fieldErrors.currentOccupation} />
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-8 w-full rounded-lg bg-zinc-900 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-zinc-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-50"
      >
        {isPending ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
