-- SmartESH v47 — Teacher assignment RLS policies
-- Run this migration in Supabase SQL Editor after the initial SmartESH setup.

alter table public.assignments enable row level security;
alter table public.assignment_targets enable row level security;

drop policy if exists teacher_own_assignments_select_v47 on public.assignments;
create policy teacher_own_assignments_select_v47
on public.assignments for select
using (
  teacher_id = auth.uid()
  or public.current_role() = 'admin'
  or exists (
    select 1 from public.assignment_targets t
    where t.assignment_id = assignments.id and t.student_id = auth.uid()
  )
);

drop policy if exists teacher_own_assignments_insert_v47 on public.assignments;
create policy teacher_own_assignments_insert_v47
on public.assignments for insert
with check (
  teacher_id = auth.uid()
  and public.current_role() = 'teacher'
);

drop policy if exists teacher_own_assignments_update_v47 on public.assignments;
create policy teacher_own_assignments_update_v47
on public.assignments for update
using (teacher_id = auth.uid() or public.current_role() = 'admin')
with check (teacher_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists teacher_own_assignments_delete_v47 on public.assignments;
create policy teacher_own_assignments_delete_v47
on public.assignments for delete
using (teacher_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists assignment_targets_read_v47 on public.assignment_targets;
create policy assignment_targets_read_v47
on public.assignment_targets for select
using (
  student_id = auth.uid()
  or public.current_role() = 'admin'
  or exists (
    select 1 from public.assignments a
    where a.id = assignment_id and a.teacher_id = auth.uid()
  )
);

drop policy if exists assignment_targets_teacher_write_v47 on public.assignment_targets;
create policy assignment_targets_teacher_write_v47
on public.assignment_targets for all
using (
  public.current_role() = 'admin'
  or exists (
    select 1 from public.assignments a
    where a.id = assignment_id and a.teacher_id = auth.uid()
  )
)
with check (
  public.current_role() = 'admin'
  or exists (
    select 1 from public.assignments a
    where a.id = assignment_id and a.teacher_id = auth.uid()
  )
);

select 'SmartESH v47 assignment RLS installed' as status;
