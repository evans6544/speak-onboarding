"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { isCeoAuthenticated } from "@/lib/ceo-auth";

export type DeleteApplicantState = {
  success: boolean;
  message: string;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function deleteApplicant(
  _previousState: DeleteApplicantState,
  formData: FormData,
): Promise<DeleteApplicantState> {
  if (!(await isCeoAuthenticated())) {
    return {
      success: false,
      message: "Your CEO session has expired. Sign in again.",
    };
  }

  const applicantId = String(formData.get("applicantId") ?? "").trim();

  if (!UUID_PATTERN.test(applicantId)) {
    return { success: false, message: "Invalid applicant id." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applicants")
    .delete()
    .eq("id", applicantId)
    .select("id")
    .maybeSingle();

  if (error || !data) {
    const message =
      error?.message ??
      "The applicant was not found or deletion is blocked by Supabase RLS.";

    console.error("Failed to delete applicant:", message);
    return {
      success: false,
      message: `Unable to delete applicant: ${message}`,
    };
  }

  revalidatePath("/dashboard");

  return { success: true, message: "Applicant deleted successfully." };
}
