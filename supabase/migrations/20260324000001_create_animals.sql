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
