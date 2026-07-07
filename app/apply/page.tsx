import type { Metadata } from "next";
import Link from "next/link";
import ApplicationForm from "./application-form";

export const metadata: Metadata = {
  title: "Apply | SPEAK Onboarding Portal",
  description: "Apply to join SPEAK Lithuania as a volunteer or intern",
};

export default function ApplyPage() {
  return (
    <div className="flex flex-1 flex-col bg-gradient-to-b from-zinc-50 to-zinc-100 px-6 py-12 dark:from-zinc-950 dark:to-zinc-900 sm:py-16">
      <main className="mx-auto w-full max-w-lg">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
            />
          </svg>
          Back to home
        </Link>

        <div className="mt-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-50">
            Apply to SPEAK
          </h1>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Fill in the form below to start your onboarding journey.
          </p>
        </div>

        <div className="mt-8">
          <ApplicationForm />
        </div>
      </main>
    </div>
  );
}
