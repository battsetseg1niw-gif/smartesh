# SmartESH v42 Question Bank API

Suggested production endpoints/server actions:

- `POST /admin/import-batches`
- `POST /admin/import-batches/:id/parse`
- `POST /admin/import-batches/:id/classify`
- `GET /admin/import-batches/:id`
- `GET /admin/questions?status=review`
- `PATCH /admin/questions/:id/classification`
- `POST /admin/questions/:id/verify-answer-key`
- `POST /admin/questions/:id/set-rights-status`
- `POST /admin/questions/:id/publish`
- `POST /admin/questions/:id/archive`
- `GET /questions?status=published&year=...&skill=...&topic=...`
- `POST /teacher/tests/from-question-bank`

Security:
- import/classify/review/publish are Admin-only
- Question Bank read for teachers exposes only Published items
- student delivery is through Published exams/practice/assignments
- never expose answer keys before submission
