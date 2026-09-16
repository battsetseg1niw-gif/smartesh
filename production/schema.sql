-- SmartESH v40 production schema blueprint (PostgreSQL/Supabase-ready)
-- Blueprint only: review migrations, RLS, indexes and provider integration before deployment.
create type user_role as enum ('student','teacher','admin');
create type content_status as enum ('draft','review','published','archived');

create table profiles (
  id uuid primary key,
  role user_role not null,
  full_name text,
  access_status text not null default 'free',
  created_at timestamptz not null default now()
);

create table questions (
  id uuid primary key default gen_random_uuid(),
  year int check (year between 2006 and 2026 or year is null),
  version text,
  skill text not null,
  topic text,
  subtopic text,
  question_type text,
  difficulty text,
  body text not null,
  correct_answer text,
  status content_status not null default 'draft',
  ai_confidence numeric check (ai_confidence between 0 and 100),
  answer_key_status text not null default 'pending',
  rights_status text not null default 'pending',
  created_at timestamptz not null default now()
);

create table question_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references questions(id) on delete cascade,
  label text not null,
  body text not null,
  position int not null
);

create table exams (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  exam_type text not null,
  year int,
  version text,
  duration_minutes int,
  status content_status not null default 'draft',
  created_at timestamptz not null default now()
);

create table exam_questions (
  exam_id uuid references exams(id) on delete cascade,
  question_id uuid references questions(id) on delete cascade,
  position int not null,
  points numeric not null default 1,
  primary key (exam_id, question_id)
);

create table assignments (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references profiles(id),
  title text not null,
  source_type text not null,
  deadline timestamptz,
  status text not null default 'draft',
  created_at timestamptz not null default now()
);

create table assignment_targets (
  assignment_id uuid references assignments(id) on delete cascade,
  student_id uuid references profiles(id) on delete cascade,
  status text not null default 'assigned',
  primary key (assignment_id, student_id)
);

create table attempts (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id),
  assignment_id uuid references assignments(id),
  exam_id uuid references exams(id),
  channel text not null check (channel in ('digital','paper')),
  started_at timestamptz,
  submitted_at timestamptz,
  score numeric,
  percentage numeric
);

create table attempt_answers (
  attempt_id uuid references attempts(id) on delete cascade,
  question_id uuid references questions(id),
  selected_answer text,
  is_correct boolean,
  answered_at timestamptz,
  primary key (attempt_id, question_id)
);

create table mistakes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references profiles(id),
  attempt_id uuid references attempts(id) on delete cascade,
  question_id uuid references questions(id),
  topic text,
  status text not null default 'new'
);

create table paper_batches (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid not null references profiles(id),
  exam_id uuid references exams(id),
  batch_name text not null,
  scanned_count int not null default 0,
  created_at timestamptz not null default now()
);

create table notifications (
  id uuid primary key default gen_random_uuid(),
  audience text not null,
  type text not null,
  title text not null,
  body text not null,
  publish_at timestamptz,
  pinned boolean not null default false
);

create table payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  provider text not null default 'QPay',
  amount int not null,
  provider_ref text,
  status text not null default 'pending',
  verified_at timestamptz
);

create table entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  plan text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'active'
);

create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references profiles(id),
  action text not null,
  entity_type text not null,
  entity_id uuid,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index questions_taxonomy_idx on questions(year, skill, topic, status);
create index attempts_student_idx on attempts(student_id, submitted_at desc);
create index mistakes_student_topic_idx on mistakes(student_id, topic, status);
create index notifications_publish_idx on notifications(publish_at desc);
create index entitlements_user_idx on entitlements(user_id, ends_at desc);
