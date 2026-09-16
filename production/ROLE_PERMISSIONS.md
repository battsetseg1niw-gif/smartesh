# SmartESH v40 Role & Data Access Blueprint

## Student
- Read only published questions/exams exposed through assigned/public content.
- Read/write only own attempts and attempt answers.
- Read only own mistakes, progress, notifications and entitlement.
- Never read `questions.correct_answer` during an active attempt.

## Teacher
- Read published Question Bank.
- Create/read/update own assignments and assignment targets.
- Read results for students targeted by their assignments.
- Create/read own paper batches and related analytics.
- Cannot publish global Question Bank content or edit global pricing/settings.

## Admin
- Manage content lifecycle: draft → review → published → archived.
- Review AI classification and answer-key/source-rights status.
- Manage users, entitlements, notifications and site settings.
- Sensitive actions must write `audit_logs`.

## Server-only
- QPay verification and Premium entitlement creation.
- Correct-answer comparison / scoring.
- AI import processing and confidence policy.
- OMR image processing.
- Admin authorization for destructive or privileged actions.

## Production requirement
Use database Row Level Security (RLS) plus server-side authorization. UI hiding is not authorization.
