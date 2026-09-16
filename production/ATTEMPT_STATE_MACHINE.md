# SmartESH v43 Attempt State Machine

`in_progress`
→ user answers; autosave is allowed

`submitted`
→ answers are locked; no further mutation

Scoring branch:
- all required keys verified → `scoring_status = scored`
- answer key missing/unverified → `scoring_status = unverified`

Assignment target:
- assigned
- started
- submitted
- reviewed

Important:
An official past exam without a verified answer key can still be completed and preserved.
SmartESH must not fabricate score/correctness for it.
