-- Extensions
create extension if not exists "uuid-ossp";

-- ─── USERS ────────────────────────────────────────────────────────────────────
create table users (
  id            uuid primary key default uuid_generate_v4(),
  email         text unique not null,
  campus        text not null,
  first_name    text,
  verified      boolean default false,
  created_at    timestamptz default now()
);

-- ─── MAGIC LINKS ──────────────────────────────────────────────────────────────
create table magic_links (
  id         uuid primary key default uuid_generate_v4(),
  email      text not null,
  token      text not null unique,
  expires_at timestamptz not null,
  used       boolean default false,
  created_at timestamptz default now()
);

-- ─── PROFILES ─────────────────────────────────────────────────────────────────
create table profiles (
  id              uuid primary key references users(id) on delete cascade,
  group_size      text check (group_size in ('1on1','small','either','large')),
  place_vibe      text check (place_vibe in ('quiet','chill','anywhere','loud')),
  plan_style      text check (plan_style in ('lastminute','dayof','ahead','planahead')),
  activities      text[] not null default '{}',
  timing          text[] not null default '{}',
  follow_through  int check (follow_through between 1 and 5) default 3,
  openness        int check (openness between 1 and 5) default 3,
  duration        text check (duration in ('quick','medium','long')),
  comfort_level   text check (comfort_level in ('alot','okay','social')),
  updated_at      timestamptz default now()
);

-- ─── PLANS ────────────────────────────────────────────────────────────────────
create table plans (
  id               uuid primary key default uuid_generate_v4(),
  creator_id       uuid not null references users(id) on delete cascade,
  campus           text not null,
  activity         text not null,
  zone             text not null,
  time_window      text not null,
  note             text check (char_length(note) <= 120),
  spots            int not null check (spots between 1 and 3) default 1,
  exact_location   text not null,
  exact_time       text not null,
  is_active        boolean default true,
  is_matched       boolean default false,
  expires_at       timestamptz not null,
  created_at       timestamptz default now()
);

-- ─── APPLICATIONS ─────────────────────────────────────────────────────────────
create table applications (
  id             uuid primary key default uuid_generate_v4(),
  plan_id        uuid not null references plans(id) on delete cascade,
  applicant_id   uuid not null references users(id) on delete cascade,
  status         text not null default 'pending'
    check (status in ('pending','yes_creator','matched','declined')),
  created_at     timestamptz default now(),
  unique(plan_id, applicant_id)
);

-- ─── MATCHES ──────────────────────────────────────────────────────────────────
create table matches (
  id             uuid primary key default uuid_generate_v4(),
  plan_id        uuid not null references plans(id),
  creator_id     uuid not null references users(id),
  applicant_id   uuid not null references users(id),
  activity       text not null,
  exact_location text not null,
  exact_time     text not null,
  created_at     timestamptz default now()
);

-- ─── WAITLIST ─────────────────────────────────────────────────────────────────
create table waitlist (
  id         uuid primary key default uuid_generate_v4(),
  email      text unique not null,
  campus     text,
  created_at timestamptz default now()
);

-- ─── AUTO-EXPIRY ──────────────────────────────────────────────────────────────
create or replace function expire_plans() returns void language sql as $$
  update plans
  set is_active = false
  where expires_at < now()
  and is_active = true
  and is_matched = false;
$$;

-- ─── ROW LEVEL SECURITY ───────────────────────────────────────────────────────
alter table users        enable row level security;
alter table profiles     enable row level security;
alter table plans        enable row level security;
alter table applications enable row level security;
alter table matches      enable row level security;
alter table waitlist     enable row level security;
alter table magic_links  enable row level security;

-- Users: service role only (API routes use service role key)
create policy "users_service" on users for all using (true);
create policy "profiles_service" on profiles for all using (true);
create policy "plans_service" on plans for all using (true);
create policy "applications_service" on applications for all using (true);
create policy "matches_service" on matches for all using (true);
create policy "waitlist_service" on waitlist for all using (true);
create policy "magic_links_service" on magic_links for all using (true);

-- Realtime
alter publication supabase_realtime add table plans;
alter publication supabase_realtime add table applications;
alter publication supabase_realtime add table matches;

-- ─── AUTH TRIGGER ──────────────────────────────────────────────────────────────
-- Auto-creates a public.users row whenever a new Supabase auth user signs up.
-- Without this, signInWithOtp returns "Database error saving new user".

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email, campus)
  values (
    new.id,
    new.email,
    split_part(new.email, '@', 2)   -- e.g. 'kenyon.edu' or 'gmail.com' for test accounts
  )
  on conflict do nothing;           -- safe on retries / duplicate events
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
