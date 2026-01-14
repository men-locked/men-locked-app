insert into storage.buckets (id, name, allowed_mime_types, public)
    values ('avatars', 'avatars', ARRAY['image/*'], true);

create policy "Avatars are publicly accessible."
    on storage.objects for select
    using (bucket_id = 'avatars');

create policy "Users can upload their own avatar."
    on storage.objects for insert
    with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update their own avatar."
    on storage.objects for update
    using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can delete their own avatar."
    on storage.objects for delete
    using (bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]);
