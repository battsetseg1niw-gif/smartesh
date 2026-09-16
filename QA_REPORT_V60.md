# SmartESH v60 — Learning Center Hotfix QA

- PASS: Learning Center runtime moved out of the large app.js into independent `learning-v60.js`.
- PASS: A runtime error elsewhere in app.js can no longer prevent Learning Center lessons from rendering.
- PASS: Grammar tab contains 20 lessons.
- PASS: Vocabulary tab contains 8 topic lessons.
- PASS: Phrasal Verbs tab contains 6 lesson groups.
- PASS: Idioms tab contains 8 lessons.
- PASS: Tab buttons attach click handlers in independent runtime.
- PASS: Search input attaches input handler and its current browser-restored value is respected on first render.
- PASS: Lesson cards render into `learningGridV59`; `Хичээл үзэх` opens the lesson modal.
- PASS: Modal close, Practice, and `Үзсэн` controls are wired.
- PASS: v59 lesson data preserved; no SQL change required for this hotfix.
- PASS: v58/v57/v56/v55/v54 feature files preserved.
