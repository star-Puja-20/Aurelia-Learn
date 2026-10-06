This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:


You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Aurelia Learn setup

Use Node.js 18 or newer. Run `npm install`, copy `.env.example` to `.env.local`, add the Supabase, Gemini, and Groq values, then run `npm run dev`. The Gemini integration defaults to `gemini-2.0-flash`; set `GEMINI_MODEL` in `.env.local` if your API account exposes a different current model name.

Apply the SQL files in `supabase/migrations/` in chronological order. Existing Supabase projects must also apply `20261006143728_student_game_profiles.sql` to enable persistent per-student progress and `20261006145912_remove_learner_points.sql` to remove the former XP and coin fields.

Never commit `.env.local` or any file containing real credentials. Teachers sign in at `/auth/login`; administrators use `/auth/admin`. Teachers assign a 6-digit learner PIN when adding a student (or set one from the student list). Students sign in at `/student/login`; their level progress, learning streaks, achievement badges, and per-game accuracy are stored per student in Supabase and are used to choose review or challenge question sets. The learner experience does not use XP or coins.

## AI integration scope

Aurelia Learn has an exact 25% AI integration scope: 4 of 16 defined learning-platform capabilities are AI-assisted. AI is used only for these four teacher-assist tasks:

1. Generating a draft lesson plan from teacher observations.
2. Transcribing a student's recorded speaking response.
3. Scoring a speaking exercise and suggesting feedback.
4. Suggesting a next-session insight after an exercise.

Student enrollment, authentication, session history, progress records, level changes, and final teacher decisions remain application-controlled. AI output is presented as a suggestion and must be reviewed by the teacher before it is accepted into session history. When Gemini or Groq credentials are unavailable, the app uses local development fallbacks rather than silently claiming that an external model was used.
