-- ============================================================
-- Helper: is the current user an admin?
-- security definer avoids circular RLS on profiles
-- ============================================================
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ============================================================
-- DROP old animals policies
-- ============================================================
drop policy if exists "Public read available animals" on animals;
drop policy if exists "Admin read all animals" on animals;
drop policy if exists "Admin insert animals" on animals;
drop policy if exists "Admin update animals" on animals;
drop policy if exists "Admin delete animals" on animals;

-- ============================================================
-- NEW animals policies
-- ============================================================

-- Anon: only approved/admin-created, non-adopted
create policy "Public read available animals"
  on animals for select
  to anon
  using (
    status != 'adotado'
    and (submission_status is null or submission_status = 'approved')
  );

-- Authenticated: public animals + own submissions + admin sees all
create policy "Authenticated read animals"
  on animals for select
  to authenticated
  using (
    (status != 'adotado' and (submission_status is null or submission_status = 'approved'))
    or submitted_by = auth.uid()
    or is_admin()
  );

-- Insert: admin freely, user with own submitted_by
create policy "Authenticated insert animals"
  on animals for insert
  to authenticated
  with check (
    is_admin() or submitted_by = auth.uid()
  );

-- Update: admin can update anything
create policy "Admin update animals"
  on animals for update
  to authenticated
  using (is_admin())
  with check (true);

-- Update: user can update own pending/rejected submissions
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

-- Delete: admin only
create policy "Admin delete animals"
  on animals for delete
  to authenticated
  using (is_admin());

-- ============================================================
-- DROP & recreate interest_forms policies (admin-only read)
-- ============================================================
drop policy if exists "Anyone can submit interest form" on interest_forms;
drop policy if exists "Admin read interest forms" on interest_forms;
drop policy if exists "Admin delete interest forms" on interest_forms;

create policy "Anyone can submit interest form"
  on interest_forms for insert
  to anon, authenticated
  with check (true);

create policy "Admin read interest forms"
  on interest_forms for select
  to authenticated
  using (is_admin());

create policy "Admin delete interest forms"
  on interest_forms for delete
  to authenticated
  using (is_admin());

-- ============================================================
-- Storage: allow regular users to upload too
-- ============================================================
drop policy if exists "Authenticated upload pet photos" on storage.objects;
drop policy if exists "Authenticated delete pet photos" on storage.objects;

create policy "Authenticated upload pet photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'pet-photos');

create policy "Admin delete pet photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'pet-photos' and is_admin());
