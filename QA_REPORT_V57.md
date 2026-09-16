# SmartESH v57 — QA Report

- PASS: Teacher can select a real v51 class and create an assignment.
- PASS: Assignment is persisted in Supabase `assignments` with v57 metadata.
- PASS: Assignment questions are persisted in `assignment_items_v57`.
- PASS: All current class members are persisted in `assignment_targets`.
- PASS: Student sees only assignments targeted to the signed-in student.
- PASS: Student attempt is persisted in canonical `attempts`.
- PASS: Student answers are persisted in `assignment_responses_v57`.
- PASS: Server database stores score / percentage / submitted state.
- PASS: Teacher sees per-student Assigned / Started / Submitted status and score.
- PASS: No seeded fake student names or fake scores are added by v57.
- PASS: v56 class join flow preserved.
- PASS: v55 Legal & Support preserved.
- PASS: v54/v53 QPay flow preserved.
- PASS: v52 Excel reports and v51 Classes preserved.
- PASS: Previous-exam teacher preview, Mock import and Scanner preserved.

## Required migration
Run `production/v57_real_assignment_flow.sql` once in Supabase SQL Editor before testing v57.
