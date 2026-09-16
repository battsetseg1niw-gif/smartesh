-- SmartESH v42 Question Bank schema extension
alter table questions
  add column if not exists source_type text default 'teacher_created',
  add column if not exists source_file_id uuid,
  add column if not exists source_page int,
  add column if not exists source_question_number text,
  add column if not exists ai_tags jsonb default '[]'::jsonb,
  add column if not exists review_status text default 'pending',
  add column if not exists published_at timestamptz,
  add column if not exists published_by uuid references profiles(id);

create table if not exists import_batches (
  id uuid primary key default gen_random_uuid(),
  created_by uuid references profiles(id),
  year int check (year between 2006 and 2026 or year is null),
  version text,
  source_type text not null,
  source_file_path text,
  parser_status text not null default 'queued',
  classify_status text not null default 'queued',
  review_status text not null default 'pending',
  answer_key_status text not null default 'pending',
  rights_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table if not exists question_reviews (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  reviewer_id uuid references profiles(id),
  old_skill text,
  new_skill text,
  old_topic text,
  new_topic text,
  old_subtopic text,
  new_subtopic text,
  notes text,
  reviewed_at timestamptz not null default now()
);

create index if not exists questions_publish_filter_idx
on questions(status, year, skill, topic, subtopic, difficulty);

create index if not exists import_batches_status_idx
on import_batches(parser_status, classify_status, review_status);
