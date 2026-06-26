-- ============================================================
-- The Journey — Supabase Schema
-- Run this in the Supabase SQL Editor (Dashboard > SQL Editor)
-- ============================================================


-- ── Profiles ──────────────────────────────────────────────
create table if not exists profiles (
  id                  uuid references auth.users on delete cascade primary key,
  email               text,
  full_name           text,
  avatar_url          text,
  welcome_email_sent  boolean default false not null,
  created_at          timestamptz default now() not null
);

-- Run this separately if `profiles` already exists (create table is a no-op then):
-- alter table profiles add column if not exists welcome_email_sent boolean default false not null;

-- Auto-create a profile row when a user signs up via Google OAuth, and resolve
-- any pending journey_invites for their email into journey_members rows.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;

  insert into public.journey_members (journey_id, user_id, role, invited_by)
  select ji.journey_id, new.id, ji.role, ji.invited_by
  from public.journey_invites ji
  where lower(ji.email) = lower(new.email)
  on conflict (journey_id, user_id) do nothing;

  delete from public.journey_invites where lower(email) = lower(new.email);

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── Journeys ──────────────────────────────────────────────
create table if not exists journeys (
  id              uuid primary key default gen_random_uuid(),
  owner_id        uuid references profiles(id) on delete cascade not null,
  title           text not null,
  description     text,
  start_location  text,
  end_location    text,
  start_date      date,
  end_date        date,
  share_token     text unique not null default gen_random_uuid()::text,
  created_at      timestamptz default now() not null,
  updated_at      timestamptz default now() not null
);


-- ── Stops (waypoints on a journey) ───────────────────────
create table if not exists stops (
  id           uuid primary key default gen_random_uuid(),
  journey_id   uuid references journeys(id) on delete cascade not null,
  name         text not null,
  lat          double precision not null,
  lng          double precision not null,
  order_index  integer not null,
  reached_at   timestamptz,
  created_at   timestamptz default now() not null
);


-- ── Journey Members (access control) ─────────────────────
create table if not exists journey_members (
  id          uuid primary key default gen_random_uuid(),
  journey_id  uuid references journeys(id) on delete cascade not null,
  user_id     uuid references profiles(id) on delete cascade not null,
  role        text check (role in ('admin', 'viewer')) not null default 'viewer',
  invited_by  uuid references profiles(id),
  created_at  timestamptz default now() not null,
  unique(journey_id, user_id)
);


-- ── Posts (photos and blog entries) ──────────────────────
create table if not exists posts (
  id                  uuid primary key default gen_random_uuid(),
  journey_id          uuid references journeys(id) on delete cascade not null,
  author_id           uuid references profiles(id) on delete cascade not null,
  stop_id             uuid references stops(id) on delete set null,
  type                text check (type in ('photo', 'blog')) not null,
  title               text,
  content             text,
  media_url           text,
  custom_location_name text,
  custom_lat          double precision,
  custom_lng          double precision,
  created_at          timestamptz default now() not null,
  updated_at          timestamptz default now() not null
);


-- ── Journey Invites (pending co-admin/viewer invites by email) ──
create table if not exists journey_invites (
  id          uuid primary key default gen_random_uuid(),
  journey_id  uuid references journeys(id) on delete cascade not null,
  email       text not null,
  role        text check (role in ('admin', 'viewer')) not null default 'admin',
  invited_by  uuid references profiles(id) not null,
  created_at  timestamptz default now() not null,
  unique(journey_id, email)
);


-- ── Comments ──────────────────────────────────────────────
create table if not exists comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid references posts(id) on delete cascade not null,
  author_id   uuid references profiles(id) on delete cascade not null,
  content     text not null,
  created_at  timestamptz default now() not null
);


-- ── Row-Level Security ────────────────────────────────────
alter table profiles       enable row level security;
alter table journeys       enable row level security;
alter table stops          enable row level security;
alter table journey_members enable row level security;
alter table journey_invites enable row level security;
alter table posts          enable row level security;
alter table comments       enable row level security;


-- Helper: is the current user a member (owner OR in journey_members)?
create or replace function is_journey_member(p_journey_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from journeys j
    left join journey_members jm
      on jm.journey_id = j.id and jm.user_id = auth.uid()
    where j.id = p_journey_id
      and (j.owner_id = auth.uid() or jm.id is not null)
  );
$$;

-- Helper: is the current user an admin (owner OR admin member)?
create or replace function is_journey_admin(p_journey_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from journeys j
    left join journey_members jm
      on jm.journey_id = j.id and jm.user_id = auth.uid() and jm.role = 'admin'
    where j.id = p_journey_id
      and (j.owner_id = auth.uid() or jm.id is not null)
  );
$$;


-- profiles
create policy "auth users can read profiles"
  on profiles for select using (auth.role() = 'authenticated');
create policy "user can insert own profile"
  on profiles for insert with check (auth.uid() = id);
create policy "user can update own profile"
  on profiles for update using (auth.uid() = id);

-- journeys
create policy "member can view journey"
  on journeys for select using (is_journey_member(id));
create policy "user can create journey"
  on journeys for insert with check (auth.uid() = owner_id);
create policy "admin can update journey"
  on journeys for update using (is_journey_admin(id));
create policy "owner can delete journey"
  on journeys for delete using (owner_id = auth.uid());

-- stops
create policy "member can view stops"
  on stops for select using (is_journey_member(journey_id));
create policy "admin can insert stops"
  on stops for insert with check (is_journey_admin(journey_id));
create policy "admin can update stops"
  on stops for update using (is_journey_admin(journey_id));
create policy "admin can delete stops"
  on stops for delete using (is_journey_admin(journey_id));

-- journey_members
create policy "member can view members"
  on journey_members for select using (is_journey_member(journey_id));
create policy "admin can insert members"
  on journey_members for insert with check (is_journey_admin(journey_id));
create policy "admin can update member role"
  on journey_members for update using (is_journey_admin(journey_id));
create policy "admin can remove members"
  on journey_members for delete using (is_journey_admin(journey_id));

-- journey_invites
create policy "admin can view invites"
  on journey_invites for select using (is_journey_admin(journey_id));
create policy "admin can create invites"
  on journey_invites for insert with check (is_journey_admin(journey_id));
create policy "admin can delete invites"
  on journey_invites for delete using (is_journey_admin(journey_id));

-- posts
create policy "member can view posts"
  on posts for select using (is_journey_member(journey_id));
create policy "admin can create posts"
  on posts for insert with check (is_journey_admin(journey_id) and auth.uid() = author_id);
create policy "author or admin can update post"
  on posts for update using (auth.uid() = author_id or is_journey_admin(journey_id));
create policy "author or admin can delete post"
  on posts for delete using (auth.uid() = author_id or is_journey_admin(journey_id));

-- comments
create policy "member can view comments"
  on comments for select using (
    exists (select 1 from posts p where p.id = post_id and is_journey_member(p.journey_id))
  );
create policy "member can add comment"
  on comments for insert with check (
    auth.uid() = author_id and
    exists (select 1 from posts p where p.id = post_id and is_journey_member(p.journey_id))
  );
create policy "author can update comment"
  on comments for update using (auth.uid() = author_id);
create policy "author or admin can delete comment"
  on comments for delete using (
    auth.uid() = author_id or
    exists (select 1 from posts p where p.id = post_id and is_journey_admin(p.journey_id))
  );


-- ── Storage bucket for post media ─────────────────────────
-- Run this block separately if the bucket already exists:
insert into storage.buckets (id, name, public)
values ('post-media', 'post-media', true)
on conflict (id) do nothing;

create policy "authenticated users can upload"
  on storage.objects for insert
  with check (bucket_id = 'post-media' and auth.role() = 'authenticated');

create policy "public can read post media"
  on storage.objects for select
  using (bucket_id = 'post-media');

create policy "uploader can delete own media"
  on storage.objects for delete
  using (bucket_id = 'post-media' and auth.uid()::text = (storage.foldername(name))[1]);
