# SmartESH v75 FINAL QA

## Implemented
- Admin-published text-PDF tests (`imported_tests_v74`) are listed for Teachers.
- Teacher can preview a published imported test, select a real v51 class, and assign it atomically.
- Imported questions are copied into canonical `assignment_items_v57`.
- Real class members become `assignment_targets`.
- Student “Миний даалгавар” includes manual v57 and imported-PDF v75 assignments.
- Student runner receives safe question data through `get_assignment_items_v75`; the correct answer is not sent before submit.
- `submit_assignment_v75` scores on Supabase, saves responses/attempt score/status, updates target status, and writes exact assignment mistakes.
- Result is synced into the existing local Mistake Notebook UI for immediate review.
- Teacher results include both manual and imported assignments.
- v73 Activation Code remains the primary annual Premium flow.
- v74 real text-PDF parser/review remains active.

## Static QA
- All JavaScript files pass `node --check`.
- All `data-view` targets resolve: 0 missing.
- All local `<script src>` references exist.
- v75 SQL consolidated at `production/SMARTESH_FINAL_V75.sql`.

## Honest production limitation
- Image-only/scanned PDF OCR is not implemented yet. v74 correctly reports OCR required rather than fabricating questions.
- Real camera/answer-sheet OMR computer vision backend is not implemented yet; scanner UI remains intake/review foundation and does not fabricate scores.

These two computer-vision services must be added before claiming those specific scan features are fully automated.
