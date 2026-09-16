-- SmartESH v70 deployment update — consolidated pending migrations v57, v58, v59, v65
-- Intended after the already-installed core/v51/v52/v55/v56 schema. Safe incremental statements are preserved.
begin;
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

-- SmartESH v58 — Production UX Pack
-- Safe incremental schema. No destructive operations.

alter table public.paper_scans add column if not exists review_status text not null default 'pending';
alter table public.paper_scans add column if not exists confirmed_at timestamptz;
alter table public.paper_scans add column if not exists confirmed_by uuid references public.profiles(id);
alter table public.paper_scan_marks add column if not exists review_note text;

create table if not exists public.notification_reads_v58 (
  notification_id uuid not null references public.notifications(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key(notification_id,user_id)
);
alter table public.notification_reads_v58 enable row level security;
drop policy if exists notification_reads_own_v58 on public.notification_reads_v58;
create policy notification_reads_own_v58 on public.notification_reads_v58 for all to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());

-- Resume metadata for server-backed mock sessions. Existing attempts remain canonical results.
create table if not exists public.mock_sessions_v58 (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  exam_id uuid references public.exams(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  remaining_seconds int,
  updated_at timestamptz not null default now(),
  submitted_at timestamptz
);
alter table public.mock_sessions_v58 enable row level security;
drop policy if exists mock_sessions_own_v58 on public.mock_sessions_v58;
create policy mock_sessions_own_v58 on public.mock_sessions_v58 for all to authenticated using (student_id=auth.uid()) with check (student_id=auth.uid());
create index if not exists mock_sessions_student_exam_v58 on public.mock_sessions_v58(student_id,exam_id,updated_at desc);

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
commit;
notify pgrst, 'reload schema';
select 'SmartESH v70 deployment update installed' as status;
-- SmartESH v73: one-time activation codes for 365-day Premium
create table if not exists public.activation_settings_v73 (
 id int primary key default 1 check (id=1), facebook_url text, contact_email text, updated_at timestamptz not null default now()
);
insert into public.activation_settings_v73(id) values(1) on conflict(id) do nothing;

create table if not exists public.activation_codes_v73 (
 id uuid primary key default gen_random_uuid(), code text not null unique, plan text not null check(plan in ('student','teacher')),
 status text not null default 'unused' check(status in ('unused','used','expired','disabled')), note text,
 created_by uuid not null references public.profiles(id), created_at timestamptz not null default now(),
 expires_at timestamptz, redeemed_by uuid references public.profiles(id), redeemed_at timestamptz
);
create index if not exists activation_codes_v73_status_idx on public.activation_codes_v73(status,created_at desc);
alter table public.activation_settings_v73 enable row level security;
alter table public.activation_codes_v73 enable row level security;

drop policy if exists activation_settings_read_v73 on public.activation_settings_v73;
create policy activation_settings_read_v73 on public.activation_settings_v73 for select to authenticated using(true);
drop policy if exists activation_settings_admin_v73 on public.activation_settings_v73;
create policy activation_settings_admin_v73 on public.activation_settings_v73 for all to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin')) with check(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));
drop policy if exists activation_codes_admin_read_v73 on public.activation_codes_v73;
create policy activation_codes_admin_read_v73 on public.activation_codes_v73 for select to authenticated using(exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='admin'));

create or replace function public.create_activation_code_v73(p_plan text,p_note text default null) returns text language plpgsql security definer set search_path=public as $$
declare c text;
begin
 if not exists(select 1 from public.profiles where id=auth.uid() and role='admin') then raise exception 'Admin эрх шаардлагатай'; end if;
 if p_plan not in ('student','teacher') then raise exception 'Эрхийн төрөл буруу'; end if;
 loop c:='SMT-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,4))||'-'||upper(substr(replace(gen_random_uuid()::text,'-',''),1,4)); exit when not exists(select 1 from public.activation_codes_v73 where code=c); end loop;
 insert into public.activation_codes_v73(code,plan,note,created_by,expires_at) values(c,p_plan,nullif(trim(p_note),''),auth.uid(),now()+interval '30 days'); return c;
end $$;

create or replace function public.redeem_activation_code_v73(p_code text) returns jsonb language plpgsql security definer set search_path=public as $$
declare r public.activation_codes_v73%rowtype; urole text; base_start timestamptz;
begin
 if auth.uid() is null then raise exception 'Нэвтэрсэн account шаардлагатай'; end if;
 select * into r from public.activation_codes_v73 where code=upper(replace(trim(p_code),' ','')) for update;
 if not found then raise exception 'Код буруу байна'; end if;
 if r.status<>'unused' then raise exception 'Энэ код ашиглагдсан эсвэл идэвхгүй байна'; end if;
 if r.expires_at is not null and r.expires_at<now() then update public.activation_codes_v73 set status='expired' where id=r.id; raise exception 'Кодын хугацаа дууссан байна'; end if;
 select role into urole from public.profiles where id=auth.uid();
 if urole is null then raise exception 'Account profile олдсонгүй'; end if;
 if urole<>r.plan then raise exception 'Энэ код '||r.plan||' account-д зориулагдсан'; end if;
 select greatest(now(),coalesce(max(ends_at),now())) into base_start from public.entitlements where user_id=auth.uid() and status='active' and ends_at>now();
 insert into public.entitlements(user_id,plan,starts_at,ends_at,status) values(auth.uid(),r.plan,now(),base_start+interval '365 days','active');
 update public.profiles set access_status='premium' where id=auth.uid();
 update public.activation_codes_v73 set status='used',redeemed_by=auth.uid(),redeemed_at=now() where id=r.id;
 return jsonb_build_object('ok',true,'plan',r.plan,'ends_at',base_start+interval '365 days');
end $$;
revoke all on function public.create_activation_code_v73(text,text) from public;
revoke all on function public.redeem_activation_code_v73(text) from public;
grant execute on function public.create_activation_code_v73(text,text) to authenticated;
grant execute on function public.redeem_activation_code_v73(text) to authenticated;
