-- SmartESH v41 Auth/RLS blueprint for PostgreSQL/Supabase
-- Apply only after reviewing in a real Supabase project.

alter table profiles enable row level security;
alter table assignments enable row level security;
alter table assignment_targets enable row level security;
alter table attempts enable row level security;
alter table attempt_answers enable row level security;
alter table mistakes enable row level security;
alter table entitlements enable row level security;

-- Helper: role is stored in public.profiles, while identity comes from auth.uid().
create or replace function public.current_role()
returns text language sql stable security definer set search_path=public as $$
  select role::text from public.profiles where id = auth.uid()
$$;

-- Profiles: user can read self. Admin can read all.
create policy "profile_self_read" on profiles for select
using (id = auth.uid() or public.current_role() = 'admin');

-- Attempts: student owns attempt; admin can read; teacher access should be
-- granted through assignment ownership/target relationship in a reviewed production policy.
create policy "attempt_student_read" on attempts for select
using (student_id = auth.uid() or public.current_role() = 'admin');

create policy "attempt_student_insert" on attempts for insert
with check (student_id = auth.uid());

create policy "answer_owner_read" on attempt_answers for select
using (exists(select 1 from attempts a where a.id=attempt_id and a.student_id=auth.uid())
       or public.current_role()='admin');

create policy "mistake_owner_read" on mistakes for select
using (student_id=auth.uid() or public.current_role()='admin');

create policy "entitlement_owner_read" on entitlements for select
using (user_id=auth.uid() or public.current_role()='admin');

-- Do not add a public policy exposing questions.correct_answer.
-- Prefer a public question projection/view that excludes correct_answer,
-- and perform scoring in a server-side function/service.
