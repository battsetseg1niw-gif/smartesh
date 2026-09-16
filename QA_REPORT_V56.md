# SmartESH v56 — Student → Teacher Flow QA

- PASS: Teacher v51 class creation preserved.
- PASS: Student can join a class using the existing secure `join_class_v51` RPC.
- PASS: Join code is validated as 6 characters in the UI.
- PASS: Student can see only classes they have joined (new RLS policy).
- PASS: Student can leave their own class using existing v51 delete RLS.
- PASS: Teacher class member list continues to use `class_members_v51`.
- PASS: v52 assignment/mock Excel reports preserved.
- PASS: v53/v54 QPay server flow preserved.
- PASS: v55 Legal & Support preserved.
- PASS: no fake student/class rows added.
