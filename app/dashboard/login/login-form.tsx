"use client";

import { useActionState } from "react";
import { login, type LoginState } from "../auth-actions";

const initialState: LoginState = { error: "" };

export default function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 space-y-5">
      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-zinc-300"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={Boolean(state.error)}
          className="mt-1.5 w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-3 text-zinc-50 outline-none transition-colors focus:border-zinc-400 focus:ring-2 focus:ring-zinc-500/20"
        />
      </div>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-red-900 bg-red-950 px-4 py-3 text-sm text-red-200"
        >
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-zinc-50 px-4 text-sm font-semibold text-zinc-900 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
