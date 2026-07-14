-- Allow the temporary unauthenticated dashboard policy to mark Stage 1 task emails as sent.

drop policy if exists "Public can update stage 1 decisions for dashboard"
  on public.applicants;

create policy "Public can update stage 1 decisions for dashboard"
  on public.applicants
  for update
  to anon, authenticated
  using (true)
  with check (
    stage1_decision in ('selected', 'rejected')
    and (
      task_sent = false
      or stage1_decision = 'selected'
    )
  );
