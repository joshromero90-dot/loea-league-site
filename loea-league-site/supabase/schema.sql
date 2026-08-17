-- ============================================================================
-- The League of Extraordinary Asshole — Supabase schema
-- Run this whole file once in the Supabase SQL Editor (Project > SQL Editor
-- > New query > paste > Run) after creating your project.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- PROFILES
-- One row per manager, created automatically when someone signs up.
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null,
  team_name text,
  is_commissioner boolean not null default false,
  espn_team_id integer,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, team_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'display_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'team_name'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper: is the current user a commissioner?
create or replace function public.is_commissioner()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select coalesce(
    (select is_commissioner from public.profiles where id = auth.uid()),
    false
  );
$$;

-- ---------------------------------------------------------------------------
-- POLLS
-- ---------------------------------------------------------------------------
create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  closes_at timestamptz,
  is_closed boolean not null default false
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls (id) on delete cascade,
  option_text text not null,
  position int not null default 0
);

create table if not exists public.poll_votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls (id) on delete cascade,
  option_id uuid not null references public.poll_options (id) on delete cascade,
  voter_id uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  unique (poll_id, voter_id)
);

-- ---------------------------------------------------------------------------
-- MANAGER NOTES (commissioner announcements)
-- ---------------------------------------------------------------------------
create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles (id),
  title text not null,
  body text not null,
  pinned boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- TRADE BOARD (threaded message board)
-- ---------------------------------------------------------------------------
create table if not exists public.trade_threads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  is_closed boolean not null default false
);

create table if not exists public.trade_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.trade_threads (id) on delete cascade,
  author_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- LINKS & RESOURCES
-- ---------------------------------------------------------------------------
create table if not exists public.resources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  description text,
  category text not null default 'General',
  added_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- SITE CONTENT (rules / constitution — single editable doc, commissioner only)
-- ---------------------------------------------------------------------------
create table if not exists public.site_content (
  slug text primary key,
  title text not null,
  body text not null default '',
  updated_by uuid references public.profiles (id),
  updated_at timestamptz not null default now()
);

insert into public.site_content (slug, title, body)
values ('rules', 'League Rules & Constitution', '# League Rules

_Commissioner: edit this page from the Rules tab once logged in._')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------------
-- HALL OF FAME / LEAGUE HISTORY
-- ---------------------------------------------------------------------------
create table if not exists public.hall_of_fame (
  id uuid primary key default gen_random_uuid(),
  season_year int not null,
  champion_team text,
  champion_manager text,
  runner_up_team text,
  last_place_team text,
  punishment text,
  notes text,
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now()
);

-- ============================================================================
-- ROW LEVEL SECURITY
-- Everything is readable by any logged-in league member. Writes are
-- restricted to the author, or to commissioners for league-wide content.
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.poll_votes enable row level security;
alter table public.notes enable row level security;
alter table public.trade_threads enable row level security;
alter table public.trade_messages enable row level security;
alter table public.resources enable row level security;
alter table public.site_content enable row level security;
alter table public.hall_of_fame enable row level security;

-- profiles
create policy "profiles are viewable by authenticated users"
  on public.profiles for select
  to authenticated using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated using (auth.uid() = id);

-- polls (commissioner creates, everyone reads, everyone votes)
create policy "polls readable by authenticated users"
  on public.polls for select to authenticated using (true);
create policy "commissioners create polls"
  on public.polls for insert to authenticated
  with check (public.is_commissioner());
create policy "commissioners update polls"
  on public.polls for update to authenticated
  using (public.is_commissioner());

create policy "poll options readable by authenticated users"
  on public.poll_options for select to authenticated using (true);
create policy "commissioners create poll options"
  on public.poll_options for insert to authenticated
  with check (public.is_commissioner());

create policy "poll votes readable by authenticated users"
  on public.poll_votes for select to authenticated using (true);
create policy "members cast their own vote"
  on public.poll_votes for insert to authenticated
  with check (auth.uid() = voter_id);
create policy "members change their own vote"
  on public.poll_votes for update to authenticated
  using (auth.uid() = voter_id);
create policy "members remove their own vote"
  on public.poll_votes for delete to authenticated
  using (auth.uid() = voter_id);

-- notes (commissioner only writes, everyone reads)
create policy "notes readable by authenticated users"
  on public.notes for select to authenticated using (true);
create policy "commissioners write notes"
  on public.notes for insert to authenticated
  with check (public.is_commissioner());
create policy "commissioners update notes"
  on public.notes for update to authenticated
  using (public.is_commissioner());
create policy "commissioners delete notes"
  on public.notes for delete to authenticated
  using (public.is_commissioner());

-- trade board (any member creates/replies)
create policy "trade threads readable by authenticated users"
  on public.trade_threads for select to authenticated using (true);
create policy "members create trade threads"
  on public.trade_threads for insert to authenticated
  with check (auth.uid() = created_by);
create policy "authors or commissioners close threads"
  on public.trade_threads for update to authenticated
  using (auth.uid() = created_by or public.is_commissioner());

create policy "trade messages readable by authenticated users"
  on public.trade_messages for select to authenticated using (true);
create policy "members post trade messages"
  on public.trade_messages for insert to authenticated
  with check (auth.uid() = author_id);
create policy "authors delete their own trade messages"
  on public.trade_messages for delete to authenticated
  using (auth.uid() = author_id or public.is_commissioner());

-- resources
create policy "resources readable by authenticated users"
  on public.resources for select to authenticated using (true);
create policy "members add resources"
  on public.resources for insert to authenticated
  with check (auth.uid() = added_by);
create policy "authors or commissioners delete resources"
  on public.resources for delete to authenticated
  using (auth.uid() = added_by or public.is_commissioner());

-- site content (rules) — commissioner only writes
create policy "site content readable by authenticated users"
  on public.site_content for select to authenticated using (true);
create policy "commissioners update site content"
  on public.site_content for update to authenticated
  using (public.is_commissioner());
create policy "commissioners insert site content"
  on public.site_content for insert to authenticated
  with check (public.is_commissioner());

-- hall of fame — commissioner only writes
create policy "hall of fame readable by authenticated users"
  on public.hall_of_fame for select to authenticated using (true);
create policy "commissioners write hall of fame"
  on public.hall_of_fame for insert to authenticated
  with check (public.is_commissioner());
create policy "commissioners update hall of fame"
  on public.hall_of_fame for update to authenticated
  using (public.is_commissioner());
create policy "commissioners delete hall of fame"
  on public.hall_of_fame for delete to authenticated
  using (public.is_commissioner());

-- ============================================================================
-- MAKE YOURSELF COMMISSIONER
-- After you sign up on the site once, run this (swap in your email) so you
-- can create polls, post notes, and edit rules/history:
--
--   update public.profiles set is_commissioner = true
--   where id = (select id from auth.users where email = 'you@example.com');
-- ============================================================================

-- ============================================================================
-- EXISTING DATABASE? ADD THE ESPN TEAM LINK COLUMN
-- If you ran this schema before the Managers page's "link your ESPN team /
-- view lineup" feature was added, run this once so the column exists:
--
--   alter table public.profiles add column if not exists espn_team_id integer;
-- ============================================================================
