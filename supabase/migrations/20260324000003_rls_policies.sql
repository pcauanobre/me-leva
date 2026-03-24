-- ============================================================
-- RLS for ANIMALS
-- ============================================================
alter table animals enable row level security;

-- Public: anyone can read non-adopted animals
create policy "Public read available animals"
  on animals for select
  to anon
  using (status != 'adotado');

-- Admin: authenticated can read ALL animals (including adopted)
create policy "Admin read all animals"
  on animals for select
  to authenticated
  using (true);

-- Admin: authenticated can insert
create policy "Admin insert animals"
  on animals for insert
  to authenticated
  with check (true);

-- Admin: authenticated can update
create policy "Admin update animals"
  on animals for update
  to authenticated
  using (true)
  with check (true);

-- Admin: authenticated can delete
create policy "Admin delete animals"
  on animals for delete
  to authenticated
  using (true);

-- ============================================================
-- RLS for INTEREST_FORMS
-- ============================================================
alter table interest_forms enable row level security;

-- Public: anyone can submit an interest form (no account needed)
create policy "Anyone can submit interest form"
  on interest_forms for insert
  to anon, authenticated
  with check (true);

-- Admin: only authenticated can read submissions
create policy "Admin read interest forms"
  on interest_forms for select
  to authenticated
  using (true);

-- Admin: authenticated can delete submissions
create policy "Admin delete interest forms"
  on interest_forms for delete
  to authenticated
  using (true);
