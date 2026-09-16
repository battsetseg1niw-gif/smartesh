# SmartESH v51 — Teacher Classes

Teacher → Ангиуд:
- Create class
- Class name, level, school year, description
- Automatic 6-character join code
- View class and student count
- Copy join code
- View joined students
- Archive class

Cloud behavior:
- Run `production/v51_teacher_classes.sql` in Supabase SQL Editor.
- After migration, classes are stored in Supabase with RLS.
- Before migration, the UI uses a clearly labeled local draft fallback.

Student join backend:
- Migration includes secure `join_class_v51(code)` RPC.
- Student-facing join-code UI can be added next without exposing all class codes.
