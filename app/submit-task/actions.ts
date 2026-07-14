"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { sendTaskSubmittedEmail } from "@/lib/application-emails";

export type TaskSubmissionState = {
  success: boolean;
  message: string;
};

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export async function submitTask(
  _previousState: TaskSubmissionState,
  formData: FormData,
): Promise<TaskSubmissionState> {
  const applicantId = String(formData.get("applicantId") ?? "").trim();
  const submissionLink = String(formData.get("submissionLink") ?? "").trim();
  const comments = String(formData.get("comments") ?? "").trim();

  if (!applicantId) {
    return {
      success: false,
      message: "Missing applicant id.",
    };
  }

  if (!submissionLink) {
    return {
      success: false,
      message: "Submission link is required.",
    };
  }

  if (!isValidHttpUrl(submissionLink)) {
    return {
      success: false,
      message: "Enter a valid http or https submission link.",
    };
  }

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
