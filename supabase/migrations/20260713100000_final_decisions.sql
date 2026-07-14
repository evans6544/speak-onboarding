-- Final decision workflow after Stage 1 task submission.

alter table public.applicants
  drop constraint if exists applicants_final_decision_check;

update public.applicants
  set final_decision = 'accepted'
  where final_decision = 'approved';

alter table public.applicants
  add constraint applicants_final_decision_check
  check (final_decision in ('pending', 'accepted', 'rejected'));

comment on column public.applicants.final_decision is
  'Final hiring outcome: pending, accepted, or rejected';

drop policy if exists "Public can update final decisions for dashboard"
  on public.applicants;

create policy "Public can update final decisions for dashboard"
  on public.applicants
  for update
  to anon, authenticated
  using (true)
  with check (
    stage1_decision = 'selected'
    and task_submitted = true
    and final_decision in ('accepted', 'rejected')
  );
