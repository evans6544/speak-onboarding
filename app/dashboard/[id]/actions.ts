"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/server";

export type Stage1ReviewState = {
  success: boolean;
  message: string;
};

const initialErrorState: Stage1ReviewState = {
  success: false,
  message: "Unable to update Stage 1 decision. Please try again.",
};

export async function updateStage1Decision(
  _previousState: Stage1ReviewState,
  formData: FormData,
): Promise<Stage1ReviewState> {
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
  const update =
    decision === "selected"
      ? {
          stage1_decision: "selected",
          task,
          task_sent: false,
        }
      : {
          stage1_decision: "rejected",
          task: null,
          task_sent: false,
        };

  const { error } = await supabase
    .from("applicants")
    .update(update)
    .eq("id", applicantId);

  if (error) {
    console.error("Failed to update Stage 1 decision:", error.message);
    return initialErrorState;
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/${applicantId}`);

  return {
    success: true,
    message:
      decision === "selected"
        ? "Applicant selected for the next stage. Task saved, but no email was sent."
        : "Application rejected. No email was sent.",
  };
}
