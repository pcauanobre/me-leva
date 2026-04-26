-- Analytics: per-visitor session and event tracking.
-- Sessions are keyed by a client-generated UUID stored in localStorage so that
-- anonymous visitors can be identified across pages. Events reference sessions
-- and capture the funnel from page_view → adoption_form_submit.

create extension if not exists pgcrypto;

create table if not exists analytics_sessions (
  id text primary key,
  user_id uuid references auth.users(id) on delete set null,
  ip_address inet,
  user_agent text,
  device_type text,
  browser text,
  os text,
  referrer text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  country text,
  city text,
  is_authenticated boolean not null default false,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  ended_at timestamptz
);

create index if not exists analytics_sessions_user_idx       on analytics_sessions(user_id);
create index if not exists analytics_sessions_first_seen_idx on analytics_sessions(first_seen_at desc);
create index if not exists analytics_sessions_last_seen_idx  on analytics_sessions(last_seen_at desc);

do $$ begin
  create type analytics_event_type as enum (
    'page_view',
    'pet_click',
    'pet_view_detail',
    'adoption_form_open',
    'adoption_form_step',
    'adoption_form_submit',
    'adoption_form_abandon',
    'account_signup_start',
    'account_signup_complete',
    'login',
    'logout',
    'donation_form_submit',
    'outbound_click',
    'error'
  );
exception when duplicate_object then null; end $$;

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references analytics_sessions(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  event_type analytics_event_type not null,
  path text,
  animal_id uuid references animals(id) on delete set null,
  form_step int,
  duration_ms int,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_session_idx     on analytics_events(session_id, created_at);
create index if not exists analytics_events_user_idx        on analytics_events(user_id);
create index if not exists analytics_events_type_time_idx   on analytics_events(event_type, created_at desc);
create index if not exists analytics_events_animal_type_idx on analytics_events(animal_id, event_type);

alter table analytics_sessions enable row level security;
alter table analytics_events   enable row level security;

drop policy if exists "Anyone can insert session"   on analytics_sessions;
drop policy if exists "Anyone can update session"   on analytics_sessions;
drop policy if exists "Admin read sessions"         on analytics_sessions;
drop policy if exists "Admin delete sessions"       on analytics_sessions;
drop policy if exists "Anyone can insert event"     on analytics_events;
drop policy if exists "Admin read events"           on analytics_events;
drop policy if exists "Admin delete events"         on analytics_events;

create policy "Anyone can insert session"
  on analytics_sessions for insert
  to anon, authenticated
  with check (true);

create policy "Anyone can update session"
  on analytics_sessions for update
  to anon, authenticated
  using (true)
  with check (true);

create policy "Admin read sessions"
  on analytics_sessions for select
  to authenticated
  using (public.is_admin());

create policy "Admin delete sessions"
  on analytics_sessions for delete
  to authenticated
  using (public.is_admin());

create policy "Anyone can insert event"
  on analytics_events for insert
  to anon, authenticated
  with check (true);

create policy "Admin read events"
  on analytics_events for select
  to authenticated
  using (public.is_admin());

create policy "Admin delete events"
  on analytics_events for delete
  to authenticated
  using (public.is_admin());
