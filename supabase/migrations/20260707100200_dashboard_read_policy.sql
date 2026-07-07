-- Temporary dashboard access until authentication is added.

create policy "Public can view applications for dashboard"
  on public.applicants
  for select
  to anon, authenticated
  using (true);
