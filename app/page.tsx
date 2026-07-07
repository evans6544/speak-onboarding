import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-zinc-50 to-zinc-100 px-6 py-16 dark:from-zinc-950 dark:to-zinc-900">
      <main className="flex w-full max-w-2xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-zinc-200 bg-white px-4 py-1.5 text-sm font-medium text-zinc-600 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
          SPEAK Lithuania
        </div>

        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
          SPEAK Onboarding Portal
        </h1>

        <p className="mt-6 max-w-lg text-lg leading-relaxed text-zinc-600 sm:text-xl dark:text-zinc-400">
          AI-powered onboarding system for volunteers and interns
        </p>

        <Link
          href="/apply"
          className="mt-10 inline-flex h-12 items-center justify-center rounded-lg bg-zinc-900 px-8 text-base font-semibold text-white shadow-md transition-all hover:bg-zinc-800 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:outline-zinc-50"
        >
          Apply Now
        </Link>
      </main>
    </div>
  );
}
