-- HOTFIX: Allow users to update their own pending AND rejected submissions
-- (fixes photo upload for pending submissions)
-- Run this in the SQL Editor if you already ran v2-all.sql

drop policy if exists "User update own rejected submissions" on animals;

create policy "User update own submissions"
  on animals for update
  to authenticated
  using (
    submitted_by = auth.uid()
    and submission_status in ('pending', 'rejected')
    and not is_admin()
  )
  with check (
    submitted_by = auth.uid()
    and submission_status in ('pending', 'rejected')
  );
