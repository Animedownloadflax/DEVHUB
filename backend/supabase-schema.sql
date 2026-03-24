create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  headline text default 'DevHub member',
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.job_posts (
  id bigint generated always as identity primary key,
  title text not null,
  summary text not null,
  contract_type text not null,
  location text not null,
  skills text[] not null default '{}',
  contact_url text,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.community_posts (
  id bigint generated always as identity primary key,
  channel text not null check (channel in ('general', 'game-engine-help', '3d-graphics', 'programming')),
  body text not null,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.code_posts (
  id bigint generated always as identity primary key,
  title text not null,
  summary text not null,
  language text not null,
  repo_url text,
  snippet text,
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.video_posts (
  id bigint generated always as identity primary key,
  title text not null,
  description text not null,
  category text not null,
  video_url text not null,
  thumbnail_url text,
  views integer not null default 0 check (views >= 0),
  author_id uuid not null references auth.users(id) on delete cascade,
  author_name text not null,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists job_posts_created_at_idx on public.job_posts (created_at desc);
create index if not exists community_posts_created_at_idx on public.community_posts (created_at desc);
create index if not exists community_posts_channel_idx on public.community_posts (channel);
create index if not exists code_posts_created_at_idx on public.code_posts (created_at desc);
create index if not exists code_posts_language_idx on public.code_posts (language);
create index if not exists video_posts_created_at_idx on public.video_posts (created_at desc);
create index if not exists video_posts_category_idx on public.video_posts (category);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.job_posts enable row level security;
alter table public.community_posts enable row level security;
alter table public.code_posts enable row level security;
alter table public.video_posts enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select"
on public.profiles
for select
using (true);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id);

drop policy if exists "job_posts_select" on public.job_posts;
create policy "job_posts_select"
on public.job_posts
for select
using (true);

drop policy if exists "job_posts_insert_own" on public.job_posts;
create policy "job_posts_insert_own"
on public.job_posts
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "job_posts_update_own" on public.job_posts;
create policy "job_posts_update_own"
on public.job_posts
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "job_posts_delete_own" on public.job_posts;
create policy "job_posts_delete_own"
on public.job_posts
for delete
to authenticated
using (auth.uid() = author_id);

drop policy if exists "community_posts_select" on public.community_posts;
create policy "community_posts_select"
on public.community_posts
for select
using (true);

drop policy if exists "community_posts_insert_own" on public.community_posts;
create policy "community_posts_insert_own"
on public.community_posts
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "community_posts_update_own" on public.community_posts;
create policy "community_posts_update_own"
on public.community_posts
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "community_posts_delete_own" on public.community_posts;
create policy "community_posts_delete_own"
on public.community_posts
for delete
to authenticated
using (auth.uid() = author_id);

drop policy if exists "code_posts_select" on public.code_posts;
create policy "code_posts_select"
on public.code_posts
for select
using (true);

drop policy if exists "code_posts_insert_own" on public.code_posts;
create policy "code_posts_insert_own"
on public.code_posts
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "code_posts_update_own" on public.code_posts;
create policy "code_posts_update_own"
on public.code_posts
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "code_posts_delete_own" on public.code_posts;
create policy "code_posts_delete_own"
on public.code_posts
for delete
to authenticated
using (auth.uid() = author_id);

drop policy if exists "video_posts_select" on public.video_posts;
create policy "video_posts_select"
on public.video_posts
for select
using (true);

drop policy if exists "video_posts_insert_own" on public.video_posts;
create policy "video_posts_insert_own"
on public.video_posts
for insert
to authenticated
with check (auth.uid() = author_id);

drop policy if exists "video_posts_update_own" on public.video_posts;
create policy "video_posts_update_own"
on public.video_posts
for update
to authenticated
using (auth.uid() = author_id)
with check (auth.uid() = author_id);

drop policy if exists "video_posts_delete_own" on public.video_posts;
create policy "video_posts_delete_own"
on public.video_posts
for delete
to authenticated
using (auth.uid() = author_id);
