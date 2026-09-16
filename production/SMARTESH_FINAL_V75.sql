-- SmartESH FINAL v75 — consolidated pending SQL
-- Intended after already-installed core + v51 + v52 + v55 + v56.
-- v70 file in this build already includes v73 Activation Code migration.
-- Run once in Supabase SQL Editor.


-- ============================================================
-- INCLUDED: v70_deploy_update.sql
-- ============================================================
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


-- ============================================================
-- INCLUDED: v74_real_pdf_import.sql
-- ============================================================
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


-- ============================================================
-- INCLUDED: v75_final_assignment_engine.sql
-- ============================================================
-- SmartESH v75 FINAL — imported test assignment + protected student runner + server-side scoring
-- Run after core schema + v51/v52/v55/v56 and the v70/v73/v74 migrations.

begin;

-- Ensure attempt scoring columns exist (idempotent).
alter table public.attempts
  add column if not exists status text not null default 'in_progress',
  add column if not exists answered_count int,
  add column if not exists correct_count int,
  add column if not exists wrong_count int,
  add column if not exists score_percent numeric,
  add column if not exists scoring_status text not null default 'pending';

-- Exact assignment mistakes can point to v57 assignment items.
alter table public.mistakes
  add column if not exists assignment_item_id_v75 uuid references public.assignment_items_v57(id) on delete cascade,
  add column if not exists source_v75 text,
  add column if not exists selected_answer_v75 text,
  add column if not exists correct_answer_v75 text,
  add column if not exists explanation_v75 text;

create index if not exists mistakes_assignment_item_v75_idx
  on public.mistakes(student_id, assignment_item_id_v75, status);

-- Students must not directly SELECT correct_answer from assignment_items_v57.
drop policy if exists assignment_items_read_v57 on public.assignment_items_v57;
create policy assignment_items_read_v75 on public.assignment_items_v57
for select using (
  public.current_role() = 'admin'
  or exists (
    select 1 from public.assignments a
    where a.id = assignment_items_v57.assignment_id
      and a.teacher_id = auth.uid()
  )
);

-- Return safe student question data without correct_answer.
create or replace function public.get_assignment_items_v75(p_assignment_id uuid)
returns table(
  id uuid,
  position int,
  body text,
  options jsonb,
  explanation text,
  skill text,
  topic text,
  subtopic text,
  points numeric
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required';
  end if;

  if not exists (
    select 1 from public.assignment_targets t
    where t.assignment_id = p_assignment_id
      and t.student_id = auth.uid()
  ) then
    raise exception 'Assignment is not assigned to this student';
  end if;

  return query
    select i.id, i.position, i.body, i.options, i.explanation,
           i.skill, i.topic, i.subtopic, i.points
    from public.assignment_items_v57 i
    where i.assignment_id = p_assignment_id
    order by i.position;
end;
$$;
revoke all on function public.get_assignment_items_v75(uuid) from public;
grant execute on function public.get_assignment_items_v75(uuid) to authenticated;

-- Teacher atomically assigns an Admin-published imported PDF test to their own class.
create or replace function public.assign_imported_test_v75(
  p_test_id uuid,
  p_class_id uuid,
  p_title text,
  p_deadline timestamptz default null,
  p_duration_minutes int default 40,
  p_instructions text default null
)
returns table(assignment_id uuid, target_count int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_teacher uuid := auth.uid();
  v_assignment uuid;
  v_count int;
  v_category text;
begin
  if v_teacher is null or public.current_role() <> 'teacher' then
    raise exception 'Teacher role required';
  end if;
  if coalesce(trim(p_title),'') = '' then
    raise exception 'Assignment title is required';
  end if;
  if p_duration_minutes is null or p_duration_minutes < 1 or p_duration_minutes > 180 then
    raise exception 'Duration must be 1–180 minutes';
  end if;
  if not exists (
    select 1 from public.classes_v51 c
    where c.id = p_class_id and c.teacher_id = v_teacher and c.status = 'active'
  ) then
    raise exception 'Active teacher-owned class not found';
  end if;
  select t.category into v_category
  from public.imported_tests_v74 t
  where t.id = p_test_id and t.status = 'published';
  if not found then
    raise exception 'Published imported test not found';
  end if;
  if not exists (select 1 from public.imported_test_items_v74 i where i.test_id=p_test_id) then
    raise exception 'Imported test has no questions';
  end if;
  select count(*)::int into v_count
  from public.class_members_v51 m where m.class_id=p_class_id;
  if v_count = 0 then raise exception 'This class has no students'; end if;

  insert into public.assignments(
    teacher_id,title,source_type,deadline,status,class_id_v57,
    instructions_v57,duration_minutes_v57,topic_v57,skill_v57
  ) values (
    v_teacher,trim(p_title),'pdf_import_v75',p_deadline,'assigned',p_class_id,
    p_instructions,p_duration_minutes,v_category,coalesce(v_category,'Mixed')
  ) returning id into v_assignment;

  insert into public.assignment_items_v57(
    assignment_id,position,body,options,correct_answer,explanation,skill,topic,points
  )
  select v_assignment,i.position,i.body,i.options,i.correct_answer,i.explanation,
         coalesce(v_category,'Mixed'),v_category,1
  from public.imported_test_items_v74 i
  where i.test_id=p_test_id
  order by i.position;

  insert into public.assignment_targets(assignment_id,student_id,status)
  select v_assignment,m.student_id,'assigned'
  from public.class_members_v51 m
  where m.class_id=p_class_id
  on conflict (assignment_id,student_id) do nothing;

  return query select v_assignment,v_count;
end;
$$;
revoke all on function public.assign_imported_test_v75(uuid,uuid,text,timestamptz,int,text) from public;
grant execute on function public.assign_imported_test_v75(uuid,uuid,text,timestamptz,int,text) to authenticated;

-- Server-side scoring: the browser submits answers, but never receives the key before submit.
create or replace function public.submit_assignment_v75(
  p_assignment_id uuid,
  p_attempt_id uuid,
  p_answers jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_student uuid := auth.uid();
  v_total int := 0;
  v_correct int := 0;
  v_answered int := 0;
  v_pct numeric := 0;
  v_now timestamptz := now();
  r record;
  v_selected text;
  v_ok boolean;
  v_review jsonb := '[]'::jsonb;
  v_mistakes jsonb := '[]'::jsonb;
begin
  if v_student is null or public.current_role() <> 'student' then
    raise exception 'Student role required';
  end if;
  if not exists (
    select 1 from public.assignment_targets t
    where t.assignment_id=p_assignment_id and t.student_id=v_student
  ) then
    raise exception 'Assignment is not assigned to this student';
  end if;
  if not exists (
    select 1 from public.attempts a
    where a.id=p_attempt_id and a.assignment_id=p_assignment_id and a.student_id=v_student
  ) then
    raise exception 'Valid student attempt not found';
  end if;
  if exists (select 1 from public.attempts a where a.id=p_attempt_id and a.submitted_at is not null) then
    raise exception 'This attempt was already submitted';
  end if;

  delete from public.assignment_responses_v57 where attempt_id=p_attempt_id;
  delete from public.mistakes where attempt_id=p_attempt_id and assignment_item_id_v75 is not null;

  for r in
    select i.* from public.assignment_items_v57 i
    where i.assignment_id=p_assignment_id order by i.position
  loop
    v_total := v_total + 1;
    v_selected := nullif(trim(coalesce(p_answers ->> r.id::text,'')),'');
    if v_selected is not null then v_answered := v_answered + 1; end if;
    v_ok := (v_selected is not null and v_selected = r.correct_answer);
    if v_ok then v_correct := v_correct + 1; end if;

    insert into public.assignment_responses_v57(attempt_id,item_id,selected_answer,is_correct,answered_at)
    values(p_attempt_id,r.id,v_selected,v_ok,v_now)
    on conflict(attempt_id,item_id) do update set
      selected_answer=excluded.selected_answer,is_correct=excluded.is_correct,answered_at=excluded.answered_at;

    v_review := v_review || jsonb_build_array(jsonb_build_object(
      'item_id',r.id,'position',r.position,'selected',v_selected,'correct',r.correct_answer,'is_correct',v_ok
    ));

    if not v_ok then
      insert into public.mistakes(
        student_id,attempt_id,question_id,topic,status,assignment_item_id_v75,
        source_v75,selected_answer_v75,correct_answer_v75,explanation_v75
      ) values (
        v_student,p_attempt_id,null,coalesce(r.topic,'Assignment'),'new',r.id,
        (select a.title from public.assignments a where a.id=p_assignment_id),
        v_selected,r.correct_answer,r.explanation
      );
      v_mistakes := v_mistakes || jsonb_build_array(jsonb_build_object(
        'item_id',r.id,'body',r.body,'selected',v_selected,'correct',r.correct_answer,
        'explanation',r.explanation,'skill',r.skill,'topic',r.topic
      ));
    end if;
  end loop;

  if v_total = 0 then raise exception 'Assignment has no questions'; end if;
  v_pct := round((v_correct::numeric / v_total::numeric) * 100, 0);

  update public.attempts set
    status='submitted',submitted_at=v_now,score=v_correct,percentage=v_pct,
    score_percent=v_pct,answered_count=v_answered,correct_count=v_correct,
    wrong_count=v_total-v_correct,scoring_status='scored'
  where id=p_attempt_id;

  update public.assignment_targets set status='submitted'
  where assignment_id=p_assignment_id and student_id=v_student;

  return jsonb_build_object(
    'correct',v_correct,'total',v_total,'answered',v_answered,'percentage',v_pct,
    'review',v_review,'mistakes',v_mistakes
  );
end;
$$;
revoke all on function public.submit_assignment_v75(uuid,uuid,jsonb) from public;
grant execute on function public.submit_assignment_v75(uuid,uuid,jsonb) to authenticated;

notify pgrst, 'reload schema';
commit;

select 'SmartESH v75 FINAL assignment engine installed' as status;

