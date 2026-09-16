-- SmartESH v43 Test Engine schema extension
-- Canonical attempt + per-question response model.

alter table attempts
  add column if not exists status text not null default 'in_progress',
  add column if not exists duration_seconds int,
  add column if not exists answered_count int,
  add column if not exists correct_count int,
  add column if not exists wrong_count int,
  add column if not exists score_percent numeric,
  add column if not exists scoring_status text not null default 'pending',
  add column if not exists last_autosave_at timestamptz;

alter table attempt_answers
  add column if not exists answer_key_verified boolean not null default false,
  add column if not exists correct_answer_snapshot text,
  add column if not exists skill_snapshot text,
  add column if not exists topic_snapshot text,
  add column if not exists subtopic_snapshot text,
  add column if not exists explanation_snapshot text,
  add column if not exists flagged boolean not null default false,
  add column if not exists updated_at timestamptz not null default now();

create unique index if not exists one_answer_per_attempt_question
on attempt_answers(attempt_id, question_id);

create index if not exists attempts_status_student_idx
on attempts(student_id, status, submitted_at desc);

create index if not exists attempt_answers_topic_idx
on attempt_answers(skill_snapshot, topic_snapshot, subtopic_snapshot);

-- Production rule:
-- scoring_status:
-- pending      = active/unsubmitted
-- unverified   = submitted, but one or more required answer keys are unverified
-- scored       = verified scoring complete
