-- Stage 1 task submissions from applicants.

alter table public.applicants
  add column if not exists submission_link text,
  add column if not exists submission_comments text,
  add column if not exists task_submitted boolean not null default false,
  add column if not exists task_submitted_at timestamptz;

create index if not exists applicants_task_submitted_idx
  on public.applicants (task_submitted);

comment on column public.applicants.submission_link is 'Applicant-provided link to the completed Stage 1 assessment task';
comment on column public.applicants.submission_comments is 'Applicant comments submitted with the Stage 1 assessment task';
comment on column public.applicants.task_submitted is 'Whether the applicant has submitted the Stage 1 assessment task';
comment on column public.applicants.task_submitted_at is 'When the applicant submitted the Stage 1 assessment task';

drop policy if exists "Public can update stage 1 decisions for dashboard"
  on public.applicants;

create policy "Public can update stage 1 decisions for dashboard"
  on public.applicants
  for update
  to anon, authenticated
  using (true)
  with check (
    stage1_decision in ('selected', 'rejected')
    and task_submitted = false
    and (
      task_sent = false
      or stage1_decision = 'selected'
    )
  );

drop policy if exists "Public can submit stage 1 tasks"
  on public.applicants;

create policy "Public can submit stage 1 tasks"
  on public.applicants
  for update
  to anon, authenticated
  using (
    stage1_decision = 'selected'
    and task_sent = true
  )
  with check (
    stage1_decision = 'selected'
    and task_sent = true
    and task_submitted = true
    and task_submitted_at is not null
    and submission_link is not null
    and final_decision = 'pending'
    and final_email_sent = false
  );
