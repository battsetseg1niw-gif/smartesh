# SmartESH v44 Paper Scanner Production Pipeline

## Goal
Paper assessment must feed the same canonical result system as digital assessment.

Flow:
1. Select existing exam or create paper-test definition.
2. Attach/verify answer key.
3. Create paper batch name, e.g. `12A – Mock Test 2`.
4. Upload/capture multiple answer sheets.
5. OMR worker detects bubbles.
6. Low-confidence marks are held for manual review.
7. Student-sheet mapping is verified.
8. Once review is complete:
   - create canonical `attempts` rows with `channel = paper`
   - create `attempt_answers`
   - calculate score only when answer key is verified
   - create exact mistake records only where correctness is known
9. Teacher analytics reads both digital and paper attempts.
10. Weak-topic practice can be generated from the unified analytics.

## Important rules
- Preserve original scan for audit.
- Never fabricate score when answer key is unverified.
- OMR confidence below configured threshold requires review.
- Manual corrections must be auditable.
- Student identity mapping must be explicit.
- Batch/group naming is analysis metadata, not class-management functionality.
