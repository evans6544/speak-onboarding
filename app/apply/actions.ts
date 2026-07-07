"use server";

import { createClient } from "@/lib/server";
import {
  parseApplicationFormData,
  validateApplicationInput,
  type ApplicationFieldErrors,
} from "@/lib/application-validation";

export type SubmitApplicationResult =
  | { success: true }
  | { success: false; error: string; fieldErrors?: ApplicationFieldErrors };

export async function submitApplication(
  formData: FormData,
): Promise<SubmitApplicationResult> {
  const input = parseApplicationFormData(formData);
  const validation = validateApplicationInput(input);

  if (!validation.ok) {
    return {
      success: false,
      error: "Please fix the errors below and try again.",
      fieldErrors: validation.fieldErrors,
    };
  }

  const { data } = validation;
  const supabase = await createClient();

  const { error } = await supabase.from("applicants").insert({
    full_name: data.fullName,
    email: data.email,
    position: data.position,
    social_media: data.socialMedia || null,
    current_occupation: data.currentOccupation,
  });

  if (error) {
    console.error("Failed to save application:", error.message);
    return {
      success: false,
      error: "Something went wrong while saving your application. Please try again.",
    };
  }

  return { success: true };
}
