-- =====================================================================
-- Dispatch Intake — Supabase schema
-- Run in Supabase SQL Editor (or `supabase db push`). Idempotent-ish.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- enums ----------
do $$ begin
  create type intake_status as enum (
    'new', 'incomplete', 'contacted', 'quoted', 'booked', 'closed_lost'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type intake_urgency as enum ('low', 'normal', 'high', 'critical');
exception when duplicate_object then null; end $$;

do $$ begin
  create type user_role as enum ('admin', 'dispatcher', 'sales_rep', 'viewer');
exception when duplicate_object then null; end $$;

do $$ begin
  create type activity_type as enum (
    'intake_created',
    'status_changed',
    'assignment_changed',
    'note_added',
    'webhook_received',
    'notification_sent',
    'field_updated'
  );
exception when duplicate_object then null; end $$;

-- ---------- profiles (mirrors auth.users) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text unique,
  role user_role not null default 'viewer',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- companies (future scaling) ----------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  contact_name text,
  phone text,
  email text,
  total_requests int not null default 0,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists companies_name_idx on public.companies (lower(company_name));

-- ---------- dispatch_intakes ----------
create table if not exists public.dispatch_intakes (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- caller
  caller_name text,
  caller_phone text,
  caller_email text,
  company_name text,
  company_id uuid references public.companies(id) on delete set null,

  -- load
  pickup_location text,
  delivery_location text,
  load_type text,
  trailer_type text,
  weight text,
  pickup_date date,
  urgency intake_urgency not null default 'normal',
  special_instructions text,

  -- AI
  call_summary text,
  transcript text,
  recommended_action text,
  missing_fields jsonb,
  priority_score int,

  -- routing / state
  intake_status intake_status not null default 'new',
  source text not null default 'elevenlabs_dispatch_agent',
  assigned_to uuid references public.profiles(id) on delete set null,

  -- integration ids
  elevenlabs_call_id text,
  make_execution_id text,
  call_timestamp timestamptz
);

create index if not exists intakes_status_idx    on public.dispatch_intakes (intake_status);
create index if not exists intakes_urgency_idx   on public.dispatch_intakes (urgency);
create index if not exists intakes_assigned_idx  on public.dispatch_intakes (assigned_to);
create index if not exists intakes_created_idx   on public.dispatch_intakes (created_at desc);
create index if not exists intakes_company_idx   on public.dispatch_intakes (lower(company_name));
create index if not exists intakes_caller_idx    on public.dispatch_intakes (lower(caller_name));

-- ---------- internal_notes ----------
create table if not exists public.internal_notes (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references public.dispatch_intakes(id) on delete cascade,
  note_text text not null,
  created_at timestamptz not null default now(),
  created_by uuid references public.profiles(id) on delete set null
);
create index if not exists notes_intake_idx on public.internal_notes (intake_id, created_at desc);

-- ---------- activity_logs ----------
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  intake_id uuid not null references public.dispatch_intakes(id) on delete cascade,
  action_type activity_type not null,
  action_detail jsonb,
  created_at timestamptz not null default now(),
  actor uuid references public.profiles(id) on delete set null,
  actor_label text
);
create index if not exists activity_intake_idx on public.activity_logs (intake_id, created_at desc);

-- ---------- updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists set_intakes_updated_at on public.dispatch_intakes;
create trigger set_intakes_updated_at
before update on public.dispatch_intakes
for each row execute function public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_companies_updated_at on public.companies;
create trigger set_companies_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

-- ---------- auto-provision profile on signup ----------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'dispatcher'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- ---------- RLS ----------
alter table public.profiles         enable row level security;
alter table public.dispatch_intakes enable row level security;
alter table public.internal_notes   enable row level security;
alter table public.activity_logs    enable row level security;
alter table public.companies        enable row level security;

-- helper: current user's role
create or replace function public.current_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- profiles: every authenticated user can read; user can update own row; admin can update any
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (true);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists profiles_admin_all on public.profiles;
create policy profiles_admin_all on public.profiles
  for all to authenticated
  using (public.current_role() = 'admin')
  with check (public.current_role() = 'admin');

-- intakes: authed users can read. dispatcher/admin/sales_rep can write. viewer read-only.
drop policy if exists intakes_select on public.dispatch_intakes;
create policy intakes_select on public.dispatch_intakes
  for select to authenticated using (true);

drop policy if exists intakes_write on public.dispatch_intakes;
create policy intakes_write on public.dispatch_intakes
  for all to authenticated
  using (public.current_role() in ('admin', 'dispatcher', 'sales_rep'))
  with check (public.current_role() in ('admin', 'dispatcher', 'sales_rep'));

-- notes
drop policy if exists notes_select on public.internal_notes;
create policy notes_select on public.internal_notes
  for select to authenticated using (true);

drop policy if exists notes_write on public.internal_notes;
create policy notes_write on public.internal_notes
  for all to authenticated
  using (public.current_role() in ('admin', 'dispatcher', 'sales_rep'))
  with check (public.current_role() in ('admin', 'dispatcher', 'sales_rep'));

-- activity: read for all authed. Inserts allowed for any authed member
-- so server actions can log status/assignment/note events with the user's session.
-- Service role bypasses RLS for webhook + system-level writes.
drop policy if exists activity_select on public.activity_logs;
create policy activity_select on public.activity_logs
  for select to authenticated using (true);

drop policy if exists activity_insert on public.activity_logs;
create policy activity_insert on public.activity_logs
  for insert to authenticated
  with check (public.current_role() in ('admin', 'dispatcher', 'sales_rep'));

-- companies: read authed, write admin/dispatcher
drop policy if exists companies_select on public.companies;
create policy companies_select on public.companies
  for select to authenticated using (true);

drop policy if exists companies_write on public.companies;
create policy companies_write on public.companies
  for all to authenticated
  using (public.current_role() in ('admin', 'dispatcher'))
  with check (public.current_role() in ('admin', 'dispatcher'));
