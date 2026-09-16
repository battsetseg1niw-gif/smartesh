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
