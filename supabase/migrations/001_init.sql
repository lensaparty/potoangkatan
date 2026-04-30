create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null check (role in ('super_admin','admin','gate_crew','photographer','participant')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  date date,
  location text,
  description text,
  cover_image_url text,
  checkin_starts_at timestamptz,
  checkin_ends_at timestamptz,
  is_active boolean not null default true,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.photo_sessions (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  name text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid references public.profiles(id),
  full_name text not null,
  class_name text,
  student_id text,
  phone text,
  email text,
  session_id uuid references public.photo_sessions(id),
  ticket_token_hash text unique not null,
  ticket_short_code text unique not null,
  ticket_status text not null default 'active' check (ticket_status in ('active','revoked','used')),
  checkin_status text not null default 'not_checked_in' check (checkin_status in ('not_checked_in','checked_in')),
  checked_in_at timestamptz,
  checked_in_by uuid references public.profiles(id),
  photo_status text not null default 'not_photographed' check (photo_status in ('not_photographed','photographed')),
  photographed_at timestamptz,
  photographed_by uuid references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scan_logs (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  scanned_by uuid references public.profiles(id),
  scan_type text not null check (scan_type in ('entry_checkin','photo_booth')),
  scan_result text not null check (scan_result in ('valid','invalid','already_used','revoked','wrong_event','expired_window')),
  raw_token_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  participant_id uuid references public.participants(id) on delete set null,
  session_id uuid references public.photo_sessions(id) on delete set null,
  class_name text,
  storage_path text not null,
  file_name text,
  mime_type text,
  size_bytes bigint,
  visibility text not null default 'hidden' check (visibility in ('hidden','visible')),
  uploaded_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index if not exists idx_participants_event on public.participants(event_id);
create index if not exists idx_participants_token_hash on public.participants(ticket_token_hash);
create index if not exists idx_scan_logs_event on public.scan_logs(event_id);
create index if not exists idx_scan_logs_raw_hash on public.scan_logs(raw_token_hash);
create index if not exists idx_photos_event on public.photos(event_id);

create or replace function public.is_staff()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('super_admin','admin','gate_crew','photographer')
  );
$$;

create or replace function public.is_adminish()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and p.role in ('super_admin','admin')
  );
$$;

alter table public.profiles enable row level security;
alter table public.events enable row level security;
alter table public.photo_sessions enable row level security;
alter table public.participants enable row level security;
alter table public.scan_logs enable row level security;
alter table public.photos enable row level security;

drop policy if exists profiles_read_self on public.profiles;
create policy profiles_read_self on public.profiles for select using (id = auth.uid() or public.is_adminish());

drop policy if exists events_staff_read on public.events;
create policy events_staff_read on public.events for select using (public.is_staff() or is_active = true);
drop policy if exists events_admin_write on public.events;
create policy events_admin_write on public.events for all using (public.is_adminish()) with check (public.is_adminish());

drop policy if exists sessions_staff_read on public.photo_sessions;
create policy sessions_staff_read on public.photo_sessions for select using (public.is_staff());
drop policy if exists sessions_admin_write on public.photo_sessions;
create policy sessions_admin_write on public.photo_sessions for all using (public.is_adminish()) with check (public.is_adminish());

drop policy if exists participants_staff_read on public.participants;
create policy participants_staff_read on public.participants for select using (public.is_staff());
drop policy if exists participants_owner_read on public.participants;
create policy participants_owner_read on public.participants for select using (user_id = auth.uid());
drop policy if exists participants_admin_write on public.participants;
create policy participants_admin_write on public.participants for all using (public.is_adminish()) with check (public.is_adminish());

drop policy if exists logs_admin_read on public.scan_logs;
create policy logs_admin_read on public.scan_logs for select using (public.is_adminish());
drop policy if exists logs_staff_insert on public.scan_logs;
create policy logs_staff_insert on public.scan_logs for insert with check (public.is_staff());

drop policy if exists photos_staff_read on public.photos;
create policy photos_staff_read on public.photos for select using (public.is_staff());
drop policy if exists photos_participant_read on public.photos;
create policy photos_participant_read on public.photos for select using (
  visibility = 'visible'
  and exists (
    select 1 from public.participants p
    where p.user_id = auth.uid()
      and p.event_id = photos.event_id
      and (
        photos.participant_id = p.id
        or (photos.class_name is not null and photos.class_name = p.class_name)
        or (photos.session_id is not null and photos.session_id = p.session_id)
      )
  )
);
drop policy if exists photos_staff_insert on public.photos;
create policy photos_staff_insert on public.photos for insert with check (public.is_staff());
drop policy if exists photos_staff_update on public.photos;
create policy photos_staff_update on public.photos for update using (public.is_staff()) with check (public.is_staff());

insert into storage.buckets (id, name, public)
values ('event-photos', 'event-photos', false)
on conflict (id) do nothing;

drop policy if exists event_photos_staff_read on storage.objects;
create policy event_photos_staff_read
on storage.objects for select
using (bucket_id = 'event-photos' and public.is_staff());

drop policy if exists event_photos_participant_read on storage.objects;
create policy event_photos_participant_read
on storage.objects for select
using (
  bucket_id = 'event-photos'
  and exists (
    select 1
    from public.photos ph
    join public.participants p on p.event_id = ph.event_id
    where ph.storage_path = storage.objects.name
      and p.user_id = auth.uid()
      and ph.visibility = 'visible'
      and (
        ph.participant_id = p.id
        or (ph.class_name is not null and ph.class_name = p.class_name)
        or (ph.session_id is not null and ph.session_id = p.session_id)
      )
  )
);

drop policy if exists event_photos_staff_write on storage.objects;
create policy event_photos_staff_write
on storage.objects for all
using (bucket_id = 'event-photos' and public.is_staff())
with check (bucket_id = 'event-photos' and public.is_staff());

