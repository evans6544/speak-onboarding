"use server";

import { createClient } from "@/lib/server";
import {
  parseApplicationFormData,
  validateApplicationInput,
  type ApplicationFieldErrors,
} from "@/lib/application-validation";
import { sendApplicationSubmittedEmails } from "@/lib/application-emails";

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
    phone_number: data.phoneNumber || null,
    position: data.position,
    social_media: data.socialMedia || null,
    current_occupation: data.currentOccupation,
    application_comment: data.applicationComment || null,
    introduction_video_url: data.introductionVideoUrl,
  });

  if (error) {
    console.error("Failed to save application:", error.message);
    return {
      success: false,
      error: "Something went wrong while saving your application. Please try again.",
    };
  }

  const emailResult = await sendApplicationSubmittedEmails(data);

  if (!emailResult.ok) {
    console.error("Failed to send application emails:", emailResult.error);
    return {
      success: false,
      error: `Your application was saved, but email sending failed: ${emailResult.error}`,
    };
  }

  return { success: true };
}
