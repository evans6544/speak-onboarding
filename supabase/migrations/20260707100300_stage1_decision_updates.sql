-- Temporary unauthenticated Stage 1 review updates until CEO authentication is added.

alter table public.applicants
  drop constraint if exists applicants_stage1_decision_check;

alter table public.applicants
  add constraint applicants_stage1_decision_check
  check (stage1_decision in ('pending', 'selected', 'rejected'));

comment on column public.applicants.stage1_decision is
  'Initial screening outcome: pending, selected, or rejected';

create policy "Public can update stage 1 decisions for dashboard"
  on public.applicants
  for update
  to anon, authenticated
  using (true)
  with check (
    stage1_decision in ('selected', 'rejected')
    and task_sent = false
  );
