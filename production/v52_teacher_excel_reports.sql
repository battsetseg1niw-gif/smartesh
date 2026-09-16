-- SmartESH v52 — Teacher Excel Report RLS
-- Run after v51_teacher_classes.sql.

alter table public.profiles enable row level security;
alter table public.attempts enable row level security;
alter table public.attempt_answers enable row level security;

-- Teacher may read a profile only when that student is in one of the teacher's classes
-- or is targeted by one of the teacher's assignments.
drop policy if exists teacher_report_student_profiles_v52 on public.profiles;
create policy teacher_report_student_profiles_v52
on public.profiles for select
using (
  id = auth.uid()
  or public.current_role() = 'admin'
  or exists (
    select 1
    from public.class_members_v51 cm
    join public.classes_v51 c on c.id = cm.class_id
    where cm.student_id = profiles.id and c.teacher_id = auth.uid()
  )
  or exists (
    select 1
    from public.assignment_targets t
    join public.assignments a on a.id = t.assignment_id
    where t.student_id = profiles.id and a.teacher_id = auth.uid()
  )
);

-- Teacher can read attempts for:
-- 1) the teacher's own assignment, OR
-- 2) a student in the teacher's own class (needed for Mock Test class reports).
drop policy if exists teacher_report_attempts_v52 on public.attempts;
create policy teacher_report_attempts_v52
on public.attempts for select
using (
  student_id = auth.uid()
  or public.current_role() = 'admin'
  or exists (
    select 1 from public.assignments a
    where a.id = attempts.assignment_id and a.teacher_id = auth.uid()
  )
  or exists (
    select 1
    from public.class_members_v51 cm
    join public.classes_v51 c on c.id = cm.class_id
    where cm.student_id = attempts.student_id and c.teacher_id = auth.uid()
  )
);

-- Question-level report details, constrained through an attempt the teacher is permitted to read.
drop policy if exists teacher_report_attempt_answers_v52 on public.attempt_answers;
create policy teacher_report_attempt_answers_v52
on public.attempt_answers for select
using (
  exists (
    select 1
    from public.attempts a
    where a.id = attempt_answers.attempt_id
      and (
        a.student_id = auth.uid()
        or public.current_role() = 'admin'
        or exists (
          select 1 from public.assignments ag
          where ag.id = a.assignment_id and ag.teacher_id = auth.uid()
        )
        or exists (
          select 1
          from public.class_members_v51 cm
          join public.classes_v51 c on c.id = cm.class_id
          where cm.student_id = a.student_id and c.teacher_id = auth.uid()
        )
      )
  )
);

-- Teachers need published Mock Test metadata to choose a report.
-- Existing published exam read policy may already cover this; this policy is idempotent.
alter table public.exams enable row level security;
drop policy if exists teacher_published_mock_exam_read_v52 on public.exams;
create policy teacher_published_mock_exam_read_v52
on public.exams for select
using (
  status::text = 'published'
  or public.current_role() = 'admin'
);

select 'SmartESH v52 teacher Excel report RLS installed' as status;
