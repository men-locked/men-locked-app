create table events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  status text,
  image_url text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table events enable row level security;

-- Allow public read access
create policy "Allow public read access"
  on events for select
  to public
  using (true);

-- Allow authenticated users to insert
create policy "Allow authenticated insert"
  on events for insert
  to authenticated
  with check (true);

insert into storage.buckets (id, name, allowed_mime_types, public)
    values ('events', 'events', ARRAY['image/*'], true);

create policy "Events images are publicly accessible."
    on storage.objects for select
    using (bucket_id = 'events');

create policy "Users can upload an event image."
    on storage.objects for insert
    with check (bucket_id = 'events' and auth.role() = 'authenticated');
