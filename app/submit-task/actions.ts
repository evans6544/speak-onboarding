"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { sendTaskSubmittedEmail } from "@/lib/application-emails";
import { normalizeSubmissionUrl } from "./submission-url";

export type TaskSubmissionState = {
  success: boolean;
  message: string;
};

export async function submitTask(
  _previousState: TaskSubmissionState,
  formData: FormData,
): Promise<TaskSubmissionState> {
  const applicantId = String(formData.get("applicantId") ?? "").trim();
  const submissionUrl = normalizeSubmissionUrl(
    String(formData.get("submissionLink") ?? ""),
  );
  const comments = String(formData.get("comments") ?? "").trim();

  if (!applicantId) {
    return {
      success: false,
      message: "Missing applicant id.",
    };
  }

  if (!submissionUrl.ok) {
    return {
      success: false,
      message: submissionUrl.error,
    };
  }

  const submissionLink = submissionUrl.url;

  if (comments.length > 2000) {
    return {
      success: false,
      message: "Comments must be 2000 characters or fewer.",
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applicants")
    .update({
      submission_link: submissionLink,
      submission_comments: comments || null,
      task_submitted: true,
      task_submitted_at: new Date().toISOString(),
    })
    .eq("id", applicantId)
    .select("id, full_name, email")
    .maybeSingle();

  if (error || !data) {
    const message =
      error?.message ??
      "Task submission was blocked. Make sure the task was sent and the public submission RLS policy is applied.";

    console.error("Failed to submit task:", message);
    return {
      success: false,
      message,
    };
  }

  const emailResult = await sendTaskSubmittedEmail({
    applicantId: data.id,
    fullName: data.full_name,
    email: data.email,
    submissionLink,
    comments,
  });

  if (!emailResult.ok) {
    revalidatePath("/submit-task");
    revalidatePath(`/dashboard/${applicantId}`);
    revalidatePath("/dashboard");

    return {
      success: false,
      message: `Your task was submitted, but we could not notify the SPEAK team by email: ${emailResult.error}`,
    };
  }

  revalidatePath("/submit-task");
  revalidatePath(`/dashboard/${applicantId}`);
  revalidatePath("/dashboard");

  return {
    success: true,
    message: "Task submitted successfully. Thank you.",
  };
}
