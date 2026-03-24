-- Create pet-photos storage bucket (public for reading)
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true);

-- Anyone can read photos (public bucket)
create policy "Public read pet photos"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'pet-photos');

-- Only authenticated admin can upload
create policy "Authenticated upload pet photos"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'pet-photos');

-- Only authenticated admin can delete
create policy "Authenticated delete pet photos"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'pet-photos');
