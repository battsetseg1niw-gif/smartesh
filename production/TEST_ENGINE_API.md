# SmartESH v43 Test Engine API Blueprint

## Start
`POST /attempts`
- validate authenticated user
- validate assignment/exam visibility
- validate deadline
- validate allowed attempts
- create `attempts.status = in_progress`

## Autosave one answer
`PUT /attempts/:attemptId/answers/:questionId`
- verify attempt ownership
- reject submitted/locked attempts
- save selected answer
- save flagged state
- update `last_autosave_at`
- idempotent upsert

## Resume
`GET /attempts/:attemptId`
Return:
- question-safe content
- selected answers
- flags
- remaining time based on server timestamps
Never return correct answer during active attempt.

## Submit
`POST /attempts/:attemptId/submit`
Transaction:
1. verify ownership/status/deadline
2. lock attempt
3. snapshot submitted answers
4. determine answer-key verification status
5. if verified, calculate correctness and score server-side
6. if unverified, preserve answers and set scoring_status=unverified
7. write exact mistake records only where correctness is known
8. update linked assignment target status
9. return result summary

Submit must be idempotent.

## Result
`GET /attempts/:attemptId/result`
Only after submit.
Return per-question:
- selected answer
- correct answer only when verified and policy allows
- correctness
- skill/topic/subtopic
- explanation
- verified/unverified badge

## Security
- client never decides the official score
- client never receives service-role secrets
- correct answers never ship in active test payload
- server/database authorization required even if UI hides controls
