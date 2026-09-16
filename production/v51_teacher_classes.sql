-- SmartESH v51 — Teacher Classes
-- Run once in Supabase SQL Editor.

create table if not exists public.classes_v51 (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  level text,
  school_year text,
  description text,
  join_code text not null unique,
  status text not null default 'active' check (status in ('active','archived')),
  created_at timestamptz not null default now()
);

create table if not exists public.class_members_v51 (
  class_id uuid not null references public.classes_v51(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, student_id)
);

create index if not exists classes_v51_teacher_idx on public.classes_v51(teacher_id);
create index if not exists class_members_v51_student_idx on public.class_members_v51(student_id);

alter table public.classes_v51 enable row level security;
alter table public.class_members_v51 enable row level security;

drop policy if exists "teacher_select_own_classes_v51" on public.classes_v51;
create policy "teacher_select_own_classes_v51" on public.classes_v51
for select using (teacher_id = auth.uid());

drop policy if exists "teacher_insert_own_classes_v51" on public.classes_v51;
create policy "teacher_insert_own_classes_v51" on public.classes_v51
for insert with check (
  teacher_id = auth.uid()
  and exists (select 1 from public.profiles p where p.id=auth.uid() and p.role in ('teacher','admin'))
);

drop policy if exists "teacher_update_own_classes_v51" on public.classes_v51;
create policy "teacher_update_own_classes_v51" on public.classes_v51
for update using (teacher_id = auth.uid()) with check (teacher_id = auth.uid());

drop policy if exists "teacher_delete_own_classes_v51" on public.classes_v51;
create policy "teacher_delete_own_classes_v51" on public.classes_v51
for delete using (teacher_id = auth.uid());

drop policy if exists "teacher_select_members_v51" on public.class_members_v51;
create policy "teacher_select_members_v51" on public.class_members_v51
for select using (
  exists (select 1 from public.classes_v51 c where c.id=class_id and c.teacher_id=auth.uid())
  or student_id=auth.uid()
);

drop policy if exists "student_join_class_v51" on public.class_members_v51;
create policy "student_join_class_v51" on public.class_members_v51
for insert with check (
  student_id=auth.uid()
  and exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='student')
);

drop policy if exists "student_leave_class_v51" on public.class_members_v51;
create policy "student_leave_class_v51" on public.class_members_v51
for delete using (
  student_id=auth.uid()
  or exists (select 1 from public.classes_v51 c where c.id=class_id and c.teacher_id=auth.uid())
);

-- Secure RPC: students can join by code without being able to list all class codes.
create or replace function public.join_class_v51(p_join_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_class_id uuid;
begin
  if not exists(select 1 from profiles where id=auth.uid() and role='student') then
    raise exception 'Student account required';
  end if;
  select id into v_class_id from classes_v51
  where upper(join_code)=upper(trim(p_join_code)) and status='active'
  limit 1;
  if v_class_id is null then raise exception 'Invalid class code'; end if;
  insert into class_members_v51(class_id,student_id)
  values(v_class_id,auth.uid()) on conflict do nothing;
  return v_class_id;
end;
$$;

revoke all on function public.join_class_v51(text) from public;
grant execute on function public.join_class_v51(text) to authenticated;
