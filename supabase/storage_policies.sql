DROP POLICY IF EXISTS "Public read access for fashion-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert for fashion-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin update for fashion-media" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete for fashion-media" ON storage.objects;

create policy "Public read access for fashion-media"
on storage.objects for select to public using (bucket_id = 'fashion-media');

create policy "Admin insert for fashion-media"
on storage.objects for insert to authenticated with check (
  bucket_id = 'fashion-media' and public.is_admin_user()
);

create policy "Admin update for fashion-media"
on storage.objects for update to authenticated using (
  bucket_id = 'fashion-media' and public.is_admin_user()
);

create policy "Admin delete for fashion-media"
on storage.objects for delete to authenticated using (
  bucket_id = 'fashion-media' and public.is_admin_user()
);
