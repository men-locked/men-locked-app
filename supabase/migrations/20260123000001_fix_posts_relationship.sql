-- Add FK to profiles for postgrest relationship detection
alter table public.posts
add constraint posts_user_id_fkey_profiles
foreign key (user_id)
references public.profiles (id)
on delete cascade;
