-- ============================================
-- Me Leva v2 - User Registration + Submissions
-- Run this in the Supabase SQL Editor
-- ============================================

-- === 20260324000005_create_profiles.sql ===
-- Profiles table for role differentiation (admin vs user)
create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  phone      text,
  role       text not null default 'user' check (role in ('admin', 'user')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_profiles_role on profiles(role);

-- Reuse existing trigger function
create trigger profiles_updated_at
  before update on profiles
  for each row execute function update_updated_at();

-- RLS
alter table profiles enable row level security;

create policy "Users read own profile"
  on profiles for select
  to authenticated
  using (auth.uid() = id);

create policy "Admin read all profiles"
  on profiles for select
  to authenticated
  using (
    exists (select 1 from profiles p where p.id = auth.uid() and p.role = 'admin')
  );

create policy "Users update own profile"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users insert own profile"
  on profiles for insert
  to authenticated
  with check (auth.uid() = id);


-- === 20260324000006_create_settings.sql ===
-- Site settings (key-value store for admin config)
create table site_settings (
  key   text primary key,
  value text not null
);

alter table site_settings enable row level security;

-- Authenticated users can read settings
create policy "Authenticated read settings"
  on site_settings for select
  to authenticated
  using (true);

-- Only admin can write settings
create policy "Admin write settings"
  on site_settings for insert
  to authenticated
  with check (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Admin update settings"
  on site_settings for update
  to authenticated
  using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  )
  with check (true);

-- Seed admin WhatsApp (empty by default)
insert into site_settings (key, value) values ('admin_whatsapp', '');


-- === 20260324000007_add_submission_fields.sql ===
-- Add submission-related columns to animals table
alter table animals
  add column submitted_by uuid references auth.users(id) on delete set null,
  add column submission_status text check (submission_status in ('pending', 'approved', 'rejected')),
  add column admin_feedback text;

create index idx_animals_submission_status on animals(submission_status);
create index idx_animals_submitted_by on animals(submitted_by);


-- === 20260324000008_update_rls_policies.sql ===
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


