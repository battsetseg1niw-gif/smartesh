# SmartESH v50 — Final Production Cleanup

## Completed in v50
- Fresh Student / Teacher / Admin dashboards start from zero / empty state.
- Removed visible fabricated student names, scores, class percentages and recent-user rows.
- Removed local demo account seed, AI-review seed and Question-Bank seed.
- One-time browser cleanup removes old prototype demo localStorage keys.
- Supabase remains the source for authenticated identity/profile and cloud counts where RLS permits.
- Teacher Previous Exam remains Preview-only; Student runner remains student-facing.
- Admin Mock Test has PDF → Answer key → Preview → Publish workflow.
- Legacy Grade 10/11/12 buttons removed from visible product UI.
- Dead-looking legacy buttons are either mapped to a valid action or return a clear data-required message.
- Fake OMR scoring is blocked.
- Fake QPay browser entitlement is blocked.
- Old sample Question Bank generator is blocked in production mode.
- Notifications start empty and load cloud notifications when available.

## External integrations that cannot be truthfully called “100% live” without provider setup
1. QPay: requires real merchant credentials, callback URL and server-side payment verification.
2. OMR: requires a real image-processing/OMR backend and calibration.
3. PDF → question extraction / AI classification: requires backend parser/AI service.
4. Exact official past-paper scoring: requires verified official answer keys and publishing rights.

v50 intentionally does not fabricate these services or results.
