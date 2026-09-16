# SmartESH v40 API Boundary Blueprint

Recommended server endpoints / server actions:

- `POST /auth/register`
- `GET /me`
- `GET /questions` — published/filterable bank
- `POST /admin/imports` — upload PDF/image batch
- `POST /admin/imports/:id/classify`
- `POST /admin/questions/:id/approve`
- `POST /admin/questions/:id/publish`
- `POST /assignments`
- `GET /assignments/me`
- `POST /attempts`
- `PUT /attempts/:id/answers/:questionId` — autosave
- `POST /attempts/:id/submit` — server scoring
- `GET /attempts/:id/result`
- `GET /me/mistakes`
- `POST /paper-batches`
- `POST /paper-batches/:id/scans`
- `POST /payments/qpay/invoice`
- `POST /webhooks/qpay` — verify payment server-side
- `GET /me/entitlement`
- `GET/POST /admin/settings`
- `GET /admin/audit-logs`

Never expose service-role/database admin secrets to browser code.
