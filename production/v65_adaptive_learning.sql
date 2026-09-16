-- SmartESH v65 Adaptive Learning foundation
create table if not exists public.diagnostic_attempts_v65 (
 id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
 answers jsonb not null default '[]'::jsonb, skill_scores jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now()
);
create table if not exists public.topic_mastery_v65 (
 user_id uuid not null references auth.users(id) on delete cascade, topic text not null,
 status text not null default 'Learning' check (status in ('Learning','Practising','Mastered')),
 practice_score numeric, recheck_score numeric, updated_at timestamptz not null default now(),
 primary key(user_id,topic)
);
alter table public.diagnostic_attempts_v65 enable row level security;
alter table public.topic_mastery_v65 enable row level security;
drop policy if exists "own diagnostic v65" on public.diagnostic_attempts_v65;
create policy "own diagnostic v65" on public.diagnostic_attempts_v65 for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "own mastery v65" on public.topic_mastery_v65;
create policy "own mastery v65" on public.topic_mastery_v65 for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
