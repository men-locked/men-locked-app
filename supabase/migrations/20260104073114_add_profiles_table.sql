create table public.profiles (
    id uuid not null references auth.users on delete cascade primary key,
    username text not null unique,
    avatar_url text,
    introduction text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

alter table public.profiles enable row level security;

create policy "Enable public read access for profiles" on public.profiles for select using (true);
create policy "Enable update for users based on id" on public.profiles for update using (auth.uid() = id);

create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
    insert into public.profiles (id, username) 
    values (new.id, new.raw_user_meta_data ->> 'username'); 
    return new;
end;
$$;

create trigger on_auth_user_created 
    after insert on auth.users 
    for each row execute procedure public.handle_new_user();

create function public.handle_update_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
    update public.profiles 
    set username = new.raw_user_meta_data ->> 'username'
    where id = new.id;
    return new;
end;
$$;

create trigger on_auth_user_updated 
    after update on auth.users 
    for each row execute procedure public.handle_update_user();