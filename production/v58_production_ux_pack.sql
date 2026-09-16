-- SmartESH v58 — Production UX Pack
-- Safe incremental schema. No destructive operations.

alter table public.paper_scans add column if not exists review_status text not null default 'pending';
alter table public.paper_scans add column if not exists confirmed_at timestamptz;
alter table public.paper_scans add column if not exists confirmed_by uuid references public.profiles(id);
alter table public.paper_scan_marks add column if not exists review_note text;

create table if not exists public.notification_reads_v58 (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key(notification_id,user_id)
);
alter table public.notification_reads_v58 enable row level security;
drop policy if exists notification_reads_own_v58 on public.notification_reads_v58;
create policy notification_reads_own_v58 on public.notification_reads_v58 for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- Resume metadata for server-backed mock sessions. Existing attempts remain canonical results.
create table if not exists public.mock_sessions_v58 (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  exam_id uuid references public.exams(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  remaining_seconds int,
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);
alter table public.mock_sessions_v58 enable row level security;
drop policy if exists mock_sessions_own_v58 on public.mock_sessions_v58;
create policy mock_sessions_own_v58 on public.mock_sessions_v58 for all to authenticated using (student_id=auth.uid()) with check (student_id=auth.uid());
create index if not exists mock_sessions_student_exam_v58 on public.mock_sessions_v58(student_id,exam_id,updated_at desc);

notify pgrst, 'reload schema';
select 'SmartESH v58 Production UX Pack installed' as status;
