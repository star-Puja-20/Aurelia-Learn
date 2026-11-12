# Aurelia Learn

Aurelia Learn is a teacher-managed English-learning platform built with Next.js, React, TypeScript, and Supabase.

## Local development

Use Node.js 18 or newer. Install dependencies, copy `.env.example` to `.env.local`, fill in the Supabase, Gemini, and Groq settings, then start the app:

```bash
npm install
npm run dev
```

The Gemini integration defaults to `gemini-2.0-flash`; set `GEMINI_MODEL` if your API account uses a different model name. Keep `.env.local` and all real credentials out of source control.

## Supabase setup

Apply the migrations in chronological order as listed in [DEPLOYMENT.md](./DEPLOYMENT.md). The application uses server-side authenticated routes for teacher operations and RLS policies for database access. Do not run migrations against a live project until you have reviewed its migration history.

Teachers sign in at `/auth/login`. A teacher can start a session from the Launch Session dialog; the app records the session and opens the learner activity. Student exercise results are associated with the selected learner and session. Practice without a learner does not save results.

## Learning activities

The exercise library has 30 sets and 150 questions across letter, word, sentence, story, and conversation levels. Each level includes a guided Learn activity and reading, listening, and written practice. A set passes at 60%; levels above the learner's current level stay locked until a teacher changes the level.

Teacher notes, lesson plans, session edits, ratings, and exercise results are stored in Supabase. Generated AI plans remain drafts for teacher review.

## Student charts

The optional student chart handler uses `pandas` and `matplotlib`. Install them with `python -m pip install -r requirements.txt`. During local development, run `python api/student_chart.py` in a second terminal; Vercel can serve the handler at `/api/student_chart`.

## AI integration scope

AI assists teachers with draft lesson plans, speech transcription and scoring, and next-session insights. Enrollment, authentication, session history, progress records, level changes, and final teacher decisions remain application-controlled.
