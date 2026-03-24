-- ============================================
-- Me Leva - Complete Database Setup
-- Run this in the Supabase SQL Editor
-- ============================================

-- === 20260324000001_create_animals.sql ===
-- Create animals table
create table animals (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  slug        text not null unique,
  species     text not null,
  breed       text,
  age_months  int,
  size        text,
  sex         text not null,
  neutered    boolean not null default false,
  vaccinated  boolean not null default false,
  description text,
  status      text not null default 'disponivel',
  photo_urls  text[] not null default '{}',
  cover_photo text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Indexes for common queries
create index idx_animals_status on animals(status);
create index idx_animals_species on animals(species);
create index idx_animals_slug on animals(slug);
create index idx_animals_status_created on animals(status, created_at desc);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger animals_updated_at
  before update on animals
  for each row execute function update_updated_at();


-- === 20260324000002_create_interest_forms.sql ===
-- Create interest forms table
create table interest_forms (
  id          uuid primary key default gen_random_uuid(),
  animal_id   uuid not null references animals(id) on delete cascade,
  name        text not null,
  phone       text not null,
  message     text,
  created_at  timestamptz not null default now()
);

-- Index for admin queries (submissions per animal)
create index idx_interest_forms_animal on interest_forms(animal_id);
create index idx_interest_forms_created on interest_forms(created_at desc);


-- === 20260324000003_rls_policies.sql ===
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


-- === seed.sql ===
-- ============================================================
-- SEED DATA: Animais de teste para desenvolvimento
-- ============================================================
-- NOTA: O usuario admin deve ser criado manualmente no
-- Supabase Dashboard > Authentication > Users > Add User
-- ============================================================

insert into animals (name, slug, species, breed, age_months, size, sex, neutered, vaccinated, description, status) values
(
  'Rex',
  'rex-00000001',
  'cachorro',
  'Vira-lata',
  24,
  'medio',
  'macho',
  true,
  true,
  'Rex e um cachorro super docil e brincalhao. Foi resgatado das ruas de Fortaleza e esta pronto para encontrar uma familia amorosa. Adora passeios e e otimo com criancas.',
  'disponivel'
),
(
  'Mia',
  'mia-00000002',
  'gato',
  'Siames',
  8,
  'pequeno',
  'femea',
  true,
  true,
  'Mia e uma gatinha carinhosa e tranquila. Gosta de ficar no colo e ronronar. Ideal para apartamento.',
  'disponivel'
),
(
  'Thor',
  'thor-00000003',
  'cachorro',
  'Labrador mix',
  36,
  'grande',
  'macho',
  false,
  true,
  'Thor e um cachorro energetico que precisa de espaco para correr. Muito leal e protetor. Precisa de um lar com quintal.',
  'urgente'
),
(
  'Luna',
  'luna-00000004',
  'gato',
  'Persa',
  12,
  'pequeno',
  'femea',
  true,
  true,
  'Luna e uma gatinha elegante e independente. Ja esta castrada e vacinada. Gosta de lugares tranquilos.',
  'disponivel'
),
(
  'Bob',
  'bob-00000005',
  'cachorro',
  'Poodle',
  60,
  'pequeno',
  'macho',
  true,
  true,
  'Bob e um poodle senior muito carinhoso. Perfeito para companhar idosos ou casais tranquilos.',
  'disponivel'
),
(
  'Mel',
  'mel-00000006',
  'cachorro',
  'Vira-lata',
  4,
  'medio',
  'femea',
  false,
  true,
  'Mel e uma filhote cheia de energia! Resgatada com apenas 1 mes de vida, esta crescendo saudavel e precisa de um lar urgente.',
  'urgente'
),
(
  'Simba',
  'simba-00000007',
  'gato',
  'Vira-lata',
  18,
  'medio',
  'macho',
  true,
  true,
  'Simba foi adotado por uma familia maravilhosa!',
  'adotado'
);

-- Formularios de interesse de exemplo
insert into interest_forms (animal_id, name, phone, message)
select
  a.id,
  'Maria Silva',
  '85999991234',
  'Oi! Tenho muito interesse em adotar. Moro em apartamento com varanda telada.'
from animals a where a.slug = 'mia-00000002';

insert into interest_forms (animal_id, name, phone, message)
select
  a.id,
  'Joao Santos',
  '85988887777',
  'Tenho uma casa grande com quintal. Gostaria de saber mais sobre o processo de adocao.'
from animals a where a.slug = 'thor-00000003';

insert into interest_forms (animal_id, name, phone, message)
select
  a.id,
  'Ana Costa',
  '85977776666',
  null
from animals a where a.slug = 'rex-00000001';

