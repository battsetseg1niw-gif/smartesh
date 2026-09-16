-- SmartESH v57 — Real Assignment Flow
-- Run after v51/v52/v56 migrations.

alter table public.assignments
  add column if not exists class_id_v57 uuid references public.classes_v51(id) on delete set null,
  add column if not exists instructions_v57 text,
  add column if not exists duration_minutes_v57 int,
  add column if not exists topic_v57 text,
  add column if not exists skill_v57 text;

create table if not exists public.assignment_items_v57 (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  position int not null,
  body text not null,
  options jsonb not null default '[]'::jsonb,
  correct_answer text not null,
  explanation text,
  skill text,
  topic text,
  subtopic text,
  points numeric not null default 1,
  created_at timestamptz not null default now(),
  unique(assignment_id, position)
);

create table if not exists public.assignment_responses_v57 (
  attempt_id uuid not null references public.attempts(id) on delete cascade,
  item_id uuid not null references public.assignment_items_v57(id) on delete cascade,
  selected_answer text,
  is_correct boolean,
  answered_at timestamptz not null default now(),
  primary key (attempt_id, item_id)
);

create index if not exists assignment_items_v57_assignment_idx on public.assignment_items_v57(assignment_id, position);
create index if not exists assignment_responses_v57_attempt_idx on public.assignment_responses_v57(attempt_id);
create index if not exists assignments_class_v57_idx on public.assignments(class_id_v57, created_at desc);

alter table public.assignment_items_v57 enable row level security;
alter table public.assignment_responses_v57 enable row level security;

-- Teacher owns the assignment; targeted students may read its items.
drop policy if exists assignment_items_read_v57 on public.assignment_items_v57;
create policy assignment_items_read_v57 on public.assignment_items_v57
for select using (
  public.current_role() = 'admin'
  or exists (select 1 from public.assignments a where a.id=assignment_id and a.teacher_id=auth.uid())
  or exists (select 1 from public.assignment_targets t where t.assignment_id=assignment_items_v57.assignment_id and t.student_id=auth.uid())
);

drop policy if exists assignment_items_teacher_write_v57 on public.assignment_items_v57;
create policy assignment_items_teacher_write_v57 on public.assignment_items_v57
for all using (
  public.current_role() = 'admin'
  or exists (select 1 from public.assignments a where a.id=assignment_id and a.teacher_id=auth.uid())
) with check (
  public.current_role() = 'admin'
  or exists (select 1 from public.assignments a where a.id=assignment_id and a.teacher_id=auth.uid())
);

-- Student owns response rows; teacher can read responses to own assignments.
drop policy if exists assignment_responses_read_v57 on public.assignment_responses_v57;
create policy assignment_responses_read_v57 on public.assignment_responses_v57
for select using (
  public.current_role() = 'admin'
  or exists (select 1 from public.attempts at where at.id=attempt_id and at.student_id=auth.uid())
  or exists (
    select 1 from public.attempts at
    join public.assignments a on a.id=at.assignment_id
    where at.id=attempt_id and a.teacher_id=auth.uid()
  )
);

drop policy if exists assignment_responses_student_insert_v57 on public.assignment_responses_v57;
create policy assignment_responses_student_insert_v57 on public.assignment_responses_v57
for insert with check (
  exists (select 1 from public.attempts at where at.id=attempt_id and at.student_id=auth.uid())
);

drop policy if exists assignment_responses_student_update_v57 on public.assignment_responses_v57;
create policy assignment_responses_student_update_v57 on public.assignment_responses_v57
for update using (
  exists (select 1 from public.attempts at where at.id=attempt_id and at.student_id=auth.uid())
) with check (
  exists (select 1 from public.attempts at where at.id=attempt_id and at.student_id=auth.uid())
);

-- Student may create/update own attempts for assigned work.
alter table public.attempts enable row level security;
drop policy if exists student_assignment_attempt_insert_v57 on public.attempts;
create policy student_assignment_attempt_insert_v57 on public.attempts
for insert with check (
  student_id=auth.uid()
  and assignment_id is not null
  and exists (select 1 from public.assignment_targets t where t.assignment_id=attempts.assignment_id and t.student_id=auth.uid())
);

drop policy if exists student_assignment_attempt_update_v57 on public.attempts;
create policy student_assignment_attempt_update_v57 on public.attempts
for update using (student_id=auth.uid()) with check (student_id=auth.uid());

-- Students can update their own target lifecycle status.
drop policy if exists assignment_targets_student_update_v57 on public.assignment_targets;
create policy assignment_targets_student_update_v57 on public.assignment_targets
for update using (student_id=auth.uid()) with check (student_id=auth.uid());

notify pgrst, 'reload schema';
select 'SmartESH v57 Real Assignment Flow installed' as status;
