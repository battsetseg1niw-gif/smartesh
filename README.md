# SmartESH FINAL v75

Latest integrated build. Main end-to-end path:

Admin text-PDF import/review/publish → Teacher selects published test → real class assignment → Student runner → Supabase server-side scoring → Teacher result → exact mistake records.

## Deploy
Deploy the whole project root (the folder containing `index.html`) to the existing Vercel project so existing environment variables stay attached. Required browser-safe environment variables: `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY`. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.

## Database
If core + v51 + v52 + v55 + v56 are already installed, run only:
`production/SMARTESH_FINAL_V75.sql`

## Payment/access
Primary launch flow is v73 one-time Activation Code for 365-day Student/Teacher Premium.

## Important limitations
Scanned/image-only PDF OCR and real answer-sheet OMR computer vision are still external backend work. The UI does not fabricate OCR/OMR results.
