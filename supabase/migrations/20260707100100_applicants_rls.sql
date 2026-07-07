-- Allow public application submissions; keep reads/updates admin-only for now.

alter table public.applicants enable row level security;

create policy "Public can submit applications"
  on public.applicants
  for insert
  to anon, authenticated
  with check (
    stage1_decision = 'pending'
    and final_decision = 'pending'
    and task_sent = false
    and final_email_sent = false
    and task is null
  );
