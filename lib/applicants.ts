import { createClient } from "@/lib/server";

export type Applicant = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  phone_number: string | null;
  position: string;
  social_media: string | null;
  current_occupation: string;
  application_comment: string | null;
  introduction_video_url: string | null;
  stage1_decision: "pending" | "selected" | "rejected";
  task: string | null;
  task_sent: boolean;
  submission_link: string | null;
  submission_comments: string | null;
  task_submitted: boolean;
  task_submitted_at: string | null;
  final_decision: "pending" | "accepted" | "rejected";
  final_email_sent: boolean;
};

const applicantColumns = `
  id,
  created_at,
  full_name,
  email,
  phone_number,
  position,
  social_media,
  current_occupation,
  application_comment,
  introduction_video_url,
  stage1_decision,
  task,
  task_sent,
  submission_link,
  submission_comments,
  task_submitted,
  task_submitted_at,
  final_decision,
  final_email_sent
`;

export async function getApplicants(): Promise<Applicant[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applicants")
    .select(applicantColumns)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch applicants: ${error.message}`);
  }

  return data as Applicant[];
}

export async function getApplicant(id: string): Promise<Applicant | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("applicants")
    .select(applicantColumns)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch applicant: ${error.message}`);
  }

  return data as Applicant | null;
}
