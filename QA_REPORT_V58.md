# SmartESH v58 QA Report

- PASS: legacy randomSheet / synthetic OMR scoring removed from active source.
- PASS: paper scanner accepts real image/PDF files without fabricating answers or scores.
- PASS: printable A4 SmartESH Answer Sheet generator added.
- PASS: scanner clearly queues files as awaiting OMR; confirmation count remains zero until real service exists.
- PASS: Student Next Best Action reads real attempts/mistakes when Supabase is available.
- PASS: notification unread UX added; v58 SQL includes per-user notification read table.
- PASS: existing mock autosave preserved and unfinished-session resume banner surfaced.
- PASS: v58 SQL includes server-backed mock session foundation.
- PASS: Teacher action center reads real assignment/attempt counts.
- PASS: v57 assignment flow, v56 classes, v55 legal/support, v54 QPay hotfix preserved.
- IMPORTANT: OMR computer-vision backend is NOT falsely claimed as implemented. Real bubble recognition requires an image-processing service.
