"use server";

import { redirect } from "next/navigation";
import {
  clearCeoSession,
  createCeoSession,
  isCeoPasswordConfigured,
  verifyCeoPassword,
} from "@/lib/ceo-auth";

export type LoginState = {
  error: string;
};

export async function login(
  _previousState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const password = String(formData.get("password") ?? "");

  if (!isCeoPasswordConfigured()) {
    return {
      error: "Dashboard password is not configured on the server.",
    };
  }

  if (!password || !verifyCeoPassword(password)) {
    return { error: "Incorrect password." };
  }

  await createCeoSession();
  redirect("/dashboard");
}

export async function logout() {
  await clearCeoSession();
  redirect("/dashboard/login");
}
