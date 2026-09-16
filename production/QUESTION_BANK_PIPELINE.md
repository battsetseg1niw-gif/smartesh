# SmartESH v42 Question Bank Production Pipeline

## 1. Import
Admin uploads a PDF/image and chooses year, version and source type.
Create `import_batches` with status `queued`.

## 2. Parse / Split
A background worker:
- stores the source file securely
- extracts pages/text
- detects question boundaries
- detects A–E options when possible
- keeps page/question-number provenance
- creates Draft `questions`

If parsing is uncertain, preserve the original source reference for Admin correction.

## 3. AI Classification
For each question, classify:
- Skill
- Topic
- Subtopic
- Question type
- Difficulty
- confidence score
- optional multiple tags

Low-confidence items go to AI Review Queue.
Do not publish automatically.

## 4. Answer key
Answer keys are separate from question extraction.
Status:
- pending
- verified

Official previous-exam questions must not be scored until the answer key is verified.

## 5. Rights / copyright
Status:
- pending
- cleared
- restricted

Public publication requires a rights decision.

## 6. Publish gate
Question becomes Published only when:
1. classification is complete
2. required AI review is complete
3. answer key is verified when scoring is required
4. rights status permits publication
5. Admin explicitly publishes

## 7. Teacher use
Teachers see only Published items.
Filtering supports:
- 2006–2026
- Grammar / Vocabulary / Communication / Reading
- Topic / Subtopic
- Question type
- Difficulty
- keyword
- multi-year mixed test

## 8. Student use
Students receive questions only through Published exams/practice/assignments.
Correct answers must not be exposed during an active attempt.
