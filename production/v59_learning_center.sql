-- SmartESH v59 Learning Center
-- Run later together with the consolidated production SQL.
create table if not exists public.learning_lessons_v59 (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  lesson_type text not null check (lesson_type in ('grammar','vocabulary','phrasal','idiom')),
  title text not null,
  subtitle text,
  level text,
  exam_priority text default 'Core',
  mongolian_explanation text not null,
  content jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft','reviewed','published','archived')),
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists public.learning_progress_v59 (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  lesson_slug text not null,
  status text not null default 'started' check (status in ('started','completed','mastered')),
  score numeric,
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_slug)
);
alter table public.learning_lessons_v59 enable row level security;
alter table public.learning_progress_v59 enable row level security;
drop policy if exists learning_public_read_v59 on public.learning_lessons_v59;
create policy learning_public_read_v59 on public.learning_lessons_v59 for select using (status='published');
drop policy if exists learning_progress_own_v59 on public.learning_progress_v59;
create policy learning_progress_own_v59 on public.learning_progress_v59 for all using (auth.uid()=user_id) with check (auth.uid()=user_id);
-- Admin writes should be performed through a server-side/admin-controlled path; do not expose service role in browser.
notify pgrst, 'reload schema';
select 'SmartESH v59 Learning Center schema ready' as status;
