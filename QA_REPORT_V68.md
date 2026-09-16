# SmartESH v68 — Student Test Exit Hotfix
- Fixed `← Тестээс гарах` in Previous Exam runner.
- Added direct, independent click binding for every `[data-task-exit]` control.
- Exit hides the active runner, clears fullscreen task classes, returns to the requested view, exits browser fullscreen if active, and scrolls to top.
- Added z-index/pointer-event protection so the exit button cannot be covered by runner layers.
- No SQL change.
