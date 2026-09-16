-- SmartESH v56 — Student class membership visibility
-- Run once in Supabase SQL Editor after v51.

-- Students may read only classes they already joined. Teachers keep their existing own-class policy.
drop policy if exists "student_select_joined_classes_v56" on public.classes_v51;
create policy "student_select_joined_classes_v56" on public.classes_v51
for select using (
  exists (
    select 1 from public.class_members_v51 m
    where m.class_id = classes_v51.id
      and m.student_id = auth.uid()
  )
);

-- Existing secure join RPC remains the only way a student discovers a class by code.
-- No class-code listing is exposed to students.

notify pgrst, 'reload schema';
select 'SmartESH v56 Student Class Join installed' as status;
