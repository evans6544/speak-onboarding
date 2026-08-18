import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { isCeoAuthenticated } from "@/lib/ceo-auth";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "CEO Login | SPEAK Onboarding Portal",
  description: "Sign in to the SPEAK Lithuania CEO dashboard",
};

export default async function DashboardLoginPage() {
  if (await isCeoAuthenticated()) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 flex-col bg-zinc-950 px-6 py-12">
      <main className="mx-auto flex w-full max-w-md flex-1 items-center justify-center">
        <section className="w-full rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-sm sm:p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-400">
            SPEAK Lithuania
          </p>
          <h1 className="mt-2 text-3xl font-bold text-zinc-50">
            CEO Dashboard
          </h1>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Enter the dashboard password to continue.
          </p>

          <LoginForm />

          <Link
            href="/"
            className="mt-6 inline-flex text-sm font-medium text-zinc-400 transition-colors hover:text-zinc-50"
          >
            Back to home
          </Link>
        </section>
      </main>
    </div>
  );
}
