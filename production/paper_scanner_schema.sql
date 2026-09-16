-- SmartESH v44 Paper Scanner / OMR schema extension

alter table paper_batches
  add column if not exists answer_key_status text not null default 'pending',
  add column if not exists scanner_status text not null default 'draft',
  add column if not exists source_exam_title text,
  add column if not exists total_sheets int not null default 0,
  add column if not exists review_required_count int not null default 0,
  add column if not exists completed_at timestamptz;

create table if not exists paper_scans (
  id uuid primary key default gen_random_uuid(),
  batch_id uuid not null references paper_batches(id) on delete cascade,
  student_id uuid references profiles(id),
  original_file_path text not null,
  processing_status text not null default 'queued',
  mapping_confidence numeric,
  requires_review boolean not null default false,
  reviewed_by uuid references profiles(id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists paper_scan_marks (
  id uuid primary key default gen_random_uuid(),
  scan_id uuid not null references paper_scans(id) on delete cascade,
  question_id uuid references questions(id),
  detected_answer text,
  confidence numeric,
  manually_corrected boolean not null default false,
  corrected_answer text
);

create index if not exists paper_scans_batch_idx on paper_scans(batch_id, processing_status);
create index if not exists paper_scan_marks_scan_idx on paper_scan_marks(scan_id);
