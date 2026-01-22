-- Create posts table
create table public.posts (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null references auth.users (id) on delete cascade,
  content text not null,
  images text[] null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint posts_pkey primary key (id),
  constraint content_length check (char_length(content) <= 200)
);

-- Enable RLS
alter table public.posts enable row level security;

-- Policies for posts
create policy "Public posts are viewable by everyone." on public.posts for select using (true);

create policy "Users can create their own posts." on public.posts for insert with check ((select auth.uid()) = user_id);

create policy "Users can update their own posts." on public.posts for update using ((select auth.uid()) = user_id);

create policy "Users can delete their own posts." on public.posts for delete using ((select auth.uid()) = user_id);

-- Create storage bucket for posts
insert into storage.buckets (id, name, public) values ('posts', 'posts', true);

-- Policies for interactions with the posts bucket
create policy "Post images are publicly accessible." on storage.objects for select using (bucket_id = 'posts');

create policy "Authenticated users can upload post images." on storage.objects for insert with check (bucket_id = 'posts' and auth.role() = 'authenticated');

create policy "Users can update their own post images." on storage.objects for update using (bucket_id = 'posts' and owner = auth.uid());

create policy "Users can delete their own post images." on storage.objects for delete using (bucket_id = 'posts' and owner = auth.uid());
