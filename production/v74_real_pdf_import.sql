-- SmartESH v74: reviewed PDF imports. Run after the existing core schema.
create table if not exists public.imported_tests_v74 (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  title text not null, category text not null, level text,
  source_filename text, status text not null default 'draft' check (status in ('draft','published','archived')),
  created_at timestamptz not null default now()
);
create table if not exists public.imported_test_items_v74 (
  id uuid primary key default gen_random_uuid(),
  test_id uuid not null references public.imported_tests_v74(id) on delete cascade,
  position int not null, body text not null, options jsonb not null default '[]'::jsonb,
  correct_answer text not null, explanation text,
  unique(test_id,position)
);
alter table public.imported_tests_v74 enable row level security;
alter table public.imported_test_items_v74 enable row level security;
drop policy if exists "v74 admin manage tests" on public.imported_tests_v74;
create policy "v74 admin manage tests" on public.imported_tests_v74 for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists "v74 authenticated read published tests" on public.imported_tests_v74;
create policy "v74 authenticated read published tests" on public.imported_tests_v74 for select using (status='published' and auth.uid() is not null);
drop policy if exists "v74 admin manage items" on public.imported_test_items_v74;
create policy "v74 admin manage items" on public.imported_test_items_v74 for all using (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check (exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists "v74 authenticated read published items" on public.imported_test_items_v74;
create policy "v74 authenticated read published items" on public.imported_test_items_v74 for select using (auth.uid() is not null and exists(select 1 from public.imported_tests_v74 t where t.id=test_id and t.status='published'));
