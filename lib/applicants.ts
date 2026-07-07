import { createClient } from "@/lib/server";

export type Applicant = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  position: string;
  social_media: string | null;
  current_occupation: string;
  stage1_decision: "pending" | "approved" | "rejected";
  task: string | null;
  task_sent: boolean;
  final_decision: "pending" | "approved" | "rejected";
  final_email_sent: boolean;
};

const applicantColumns = `
  id,
  created_at,
  full_name,
  email,
  position,
  social_media,
  current_occupation,
  stage1_decision,
  task,
  task_sent,
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
