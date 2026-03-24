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
