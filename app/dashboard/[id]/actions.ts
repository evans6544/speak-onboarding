"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";
import { isCeoAuthenticated } from "@/lib/ceo-auth";
import {
  sendFinalDecisionEmail,
  sendStage1RejectionEmail,
  sendStage1TaskEmail,
} from "@/lib/application-emails";

export type Stage1ReviewState = {
  success: boolean;
  message: string;
};

export type FinalDecisionState = {
  success: boolean;
  message: string;
};

function stage1Error(message: string): Stage1ReviewState {
  return {
    success: false,
    message: `Unable to update Stage 1 decision: ${message}`,
  };
}

export async function updateStage1Decision(
  _previousState: Stage1ReviewState,
  formData: FormData,
): Promise<Stage1ReviewState> {
  if (!(await isCeoAuthenticated())) {
    return {
      success: false,
      message: "Your CEO session has expired. Sign in again.",
    };
  }

  const applicantId = String(formData.get("applicantId") ?? "");
  const decision = String(formData.get("decision") ?? "");
  const task = String(formData.get("task") ?? "").trim();

  if (!applicantId) {
    return {
      success: false,
      message: "Missing applicant id.",
    };
  }

  if (decision !== "selected" && decision !== "rejected") {
    return {
      success: false,
      message: "Choose a valid Stage 1 decision.",
    };
  }

  if (decision === "selected" && !task) {
    return {
      success: false,
      message: "Enter the task and assessment before selecting next stage.",
    };
  }

  const supabase = await createClient();

  if (decision === "rejected") {
    const { data: applicant, error } = await supabase
      .from("applicants")
      .update({
        stage1_decision: "rejected",
        task: null,
        task_sent: false,
      })
      .eq("id", applicantId)
      .select("full_name, email")
      .maybeSingle();

    if (error || !applicant) {
      const message =
        error?.message ??
        "No applicant row was updated. Apply the Stage 1 Supabase update policy migration and try again.";
      console.error("Failed to update Stage 1 decision:", message);
      return stage1Error(message);
    }

    const emailResult = await sendStage1RejectionEmail({
      fullName: applicant.full_name,
      email: applicant.email,
    });

    if (!emailResult.ok) {
      revalidatePath("/dashboard");
      revalidatePath(`/dashboard/${applicantId}`);

      return {
        success: false,
        message: `Application rejected, but rejection email failed: ${emailResult.error}`,
      };
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${applicantId}`);

    return {
      success: true,
      message: "Application rejected and rejection email sent.",
    };
  }

  const { data: applicant, error } = await supabase
    .from("applicants")
    .update({
      stage1_decision: "selected",
      task,
      task_sent: false,
    })
    .eq("id", applicantId)
    .select("full_name, email")
    .maybeSingle();

  if (error || !applicant) {
    const message =
      error?.message ??
      "No applicant row was updated. Apply the Stage 1 Supabase update policy migration and try again.";
    console.error(
      "Failed to update Stage 1 decision:",
      message,
    );
    return stage1Error(message);
  }

  const emailResult = await sendStage1TaskEmail({
    applicantId,
    fullName: applicant.full_name,
    email: applicant.email,
    task,
  });

  if (!emailResult.ok) {
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${applicantId}`);

    return {
      success: false,
      message: `Applicant selected and task saved, but task email failed: ${emailResult.error}`,
    };
  }

  const { error: taskSentError } = await supabase
    .from("applicants")
    .update({ task_sent: true })
    .eq("id", applicantId);

  if (taskSentError) {
    console.error("Failed to mark task as sent:", taskSentError.message);
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${applicantId}`);

    return {
      success: false,
      message: `Task email was sent, but the dashboard could not mark it as sent: ${taskSentError.message}`,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${applicantId}`);

  return {
    success: true,
    message: "Applicant selected for the next stage and task email sent.",
  };
}

export async function updateFinalDecision(
  _previousState: FinalDecisionState,
  formData: FormData,
): Promise<FinalDecisionState> {
  if (!(await isCeoAuthenticated())) {
    return {
      success: false,
      message: "Your CEO session has expired. Sign in again.",
    };
  }

  const applicantId = String(formData.get("applicantId") ?? "");
  const decision = String(formData.get("decision") ?? "");

  if (!applicantId) {
    return {
      success: false,
      message: "Missing applicant id.",
    };
  }

  if (decision !== "accepted" && decision !== "rejected") {
    return {
      success: false,
      message: "Choose a valid final decision.",
    };
  }

  const supabase = await createClient();
  const { data: applicant, error: applicantError } = await supabase
    .from("applicants")
    .select("id, full_name, email, task_submitted, final_email_sent")
    .eq("id", applicantId)
    .maybeSingle();

  if (applicantError || !applicant) {
    const message = applicantError?.message ?? "Applicant not found.";
    console.error("Failed to load applicant for final decision:", message);
    return {
      success: false,
      message,
    };
  }

  if (!applicant.task_submitted) {
    return {
      success: false,
      message: "Final decision is available only after task submission.",
    };
  }

  if (applicant.final_email_sent) {
    return {
      success: false,
      message: "Final decision email has already been sent.",
    };
  }

  const { data: decisionUpdate, error: decisionError } = await supabase
    .from("applicants")
    .update({
      final_decision: decision,
      final_email_sent: false,
    })
    .eq("id", applicantId)
    .eq("final_email_sent", false)
    .select("id")
    .maybeSingle();

  if (decisionError) {
    console.error("Failed to update final decision:", decisionError.message);
    return {
      success: false,
      message: `Unable to update final decision: ${decisionError.message}`,
    };
  }

  if (!decisionUpdate) {
    return {
      success: false,
      message:
        "Final decision was not saved. It may have already been sent, or the final decision policy may not be applied.",
    };
  }

  const emailResult = await sendFinalDecisionEmail({
    fullName: applicant.full_name,
    email: applicant.email,
    decision,
  });

  if (!emailResult.ok) {
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${applicantId}`);

    return {
      success: false,
      message: `Final decision saved, but email failed: ${emailResult.error}`,
    };
  }

  const { data: emailSentUpdate, error: emailSentError } = await supabase
    .from("applicants")
    .update({ final_email_sent: true })
    .eq("id", applicantId)
    .eq("final_email_sent", false)
    .select("id")
    .maybeSingle();

  if (emailSentError) {
    console.error(
      "Failed to mark final email as sent:",
      emailSentError.message,
    );
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${applicantId}`);

    return {
      success: false,
      message: `Final decision email was sent, but the dashboard could not mark it as sent: ${emailSentError.message}`,
    };
  }

  if (!emailSentUpdate) {
    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/${applicantId}`);

    return {
      success: false,
      message:
        "Final decision email was sent, but the dashboard could not mark it as sent. Please refresh and check the applicant.",
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${applicantId}`);

  return {
    success: true,
    message:
      decision === "accepted"
        ? "Applicant accepted and final email sent."
        : "Applicant rejected and final email sent.",
  };
}
