# SmartESH v44 Paper Scanner API Blueprint

- `POST /paper-batches`
- `POST /paper-batches/:id/answer-key`
- `POST /paper-batches/:id/scans`
- `GET /paper-batches/:id`
- `GET /paper-batches/:id/review`
- `PATCH /paper-scans/:scanId/marks/:markId`
- `POST /paper-batches/:id/finalize`
- `GET /paper-batches/:id/analytics`
- `POST /paper-batches/:id/create-weak-topic-practice`

Finalize transaction:
1. verify teacher/admin authorization
2. verify answer-key state
3. ensure required scan reviews are complete
4. ensure student mapping is complete
5. create paper attempts + attempt answers
6. score only verified questions
7. write mistakes where correctness is known
8. mark batch completed
9. return aggregate analytics

OMR processing should run in an isolated worker/service, not in browser JavaScript.
