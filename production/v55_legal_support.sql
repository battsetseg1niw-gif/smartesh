-- SmartESH v55 — Legal & Support requests
create table if not exists public.support_requests_v55 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  type text not null default 'other',
  message text not null,
  status text not null default 'new' check (status in ('new','in_progress','resolved','closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.support_requests_v55 enable row level security;
drop policy if exists "support insert public v55" on public.support_requests_v55;
create policy "support insert public v55" on public.support_requests_v55 for insert to anon, authenticated with check (user_id is null or user_id = auth.uid());
drop policy if exists "support own read v55" on public.support_requests_v55;
create policy "support own read v55" on public.support_requests_v55 for select to authenticated using (user_id = auth.uid());
drop policy if exists "support admin all v55" on public.support_requests_v55;
create policy "support admin all v55" on public.support_requests_v55 for all to authenticated using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
create index if not exists support_requests_v55_created_idx on public.support_requests_v55(created_at desc);
notify pgrst, 'reload schema';
select 'SmartESH v55 Legal & Support installed' as status;
