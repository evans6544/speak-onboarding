alter table public.applicants
  add column if not exists phone_number text,
  add column if not exists application_comment text,
  add column if not exists introduction_video_url text;

comment on column public.applicants.phone_number is
  'Optional applicant contact number';
comment on column public.applicants.application_comment is
  'Optional comment submitted with the application';
comment on column public.applicants.introduction_video_url is
  'Shareable link to the applicant introduction video';
