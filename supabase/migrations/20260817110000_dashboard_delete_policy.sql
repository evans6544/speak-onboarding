-- Temporary dashboard access until authentication is added.

create policy "Public can delete applications from dashboard"
  on public.applicants
  for delete
  to anon, authenticated
  using (true);
