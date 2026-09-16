# SmartESH v52 — Teacher Excel Reports

Teacher → Үр дүн now has two separate export buttons:

1. **Даалгавар Excel**
2. **Mock Test Excel**

For each export the teacher chooses:
- one assignment or one Mock Test;
- one class;
- either the whole class or selected students.

The downloaded `.xlsx` file contains:
- **Summary** — one row per selected student, including students who have not started;
- **Attempts** — one row per actual attempt;
- **Question Details** — per-question response details.

No fake rows are generated. If no attempt exists, Summary shows `Not started` and Attempts/Question Details remain header-only.

Run `production/v52_teacher_excel_reports.sql` in Supabase SQL Editor after the v51 class migration.
