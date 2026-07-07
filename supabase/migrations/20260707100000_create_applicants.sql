-- Applicant pipeline: intake form → stage 1 review → task → final decision

create table public.applicants (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  -- Application form (submitted by the applicant)
  full_name text not null,
  email text not null,
  position text not null,
  social_media text,
  current_occupation text not null,

  -- Internal review workflow
  stage1_decision text not null default 'pending'
    check (stage1_decision in ('pending', 'approved', 'rejected')),
  task text,
  task_sent boolean not null default false,
  final_decision text not null default 'pending'
    check (final_decision in ('pending', 'approved', 'rejected')),
  final_email_sent boolean not null default false
);

create index applicants_created_at_idx on public.applicants (created_at desc);
create index applicants_email_idx on public.applicants (email);
create index applicants_stage1_decision_idx on public.applicants (stage1_decision);
create index applicants_final_decision_idx on public.applicants (final_decision);

comment on table public.applicants is 'SPEAK Lithuania job/volunteer applications and review pipeline';
comment on column public.applicants.id is 'Unique identifier for the application record';
comment on column public.applicants.created_at is 'When the application was submitted';
comment on column public.applicants.full_name is 'Applicant full name from the intake form';
comment on column public.applicants.email is 'Contact email for the applicant';
comment on column public.applicants.position is 'Role the applicant is applying for';
comment on column public.applicants.social_media is 'Optional social profile links (LinkedIn, Instagram, etc.)';
comment on column public.applicants.current_occupation is 'Applicant current job or status (e.g. student, employed)';
comment on column public.applicants.stage1_decision is 'Initial screening outcome: pending, approved, or rejected';
comment on column public.applicants.task is 'Task or assignment text sent to the applicant after stage 1 approval';
comment on column public.applicants.task_sent is 'Whether the stage 2 task has been emailed to the applicant';
comment on column public.applicants.final_decision is 'Final hiring outcome: pending, approved, or rejected';
comment on column public.applicants.final_email_sent is 'Whether the final decision email has been sent';
