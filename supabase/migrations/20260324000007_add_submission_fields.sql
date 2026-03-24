-- Add submission-related columns to animals table
alter table animals
  add column submitted_by uuid references auth.users(id) on delete set null,
  add column submission_status text check (submission_status in ('pending', 'approved', 'rejected')),
  add column admin_feedback text;

create index idx_animals_submission_status on animals(submission_status);
create index idx_animals_submitted_by on animals(submitted_by);
