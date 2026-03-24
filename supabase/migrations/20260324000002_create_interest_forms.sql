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
