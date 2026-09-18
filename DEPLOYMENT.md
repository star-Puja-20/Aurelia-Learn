# Aurelia Learn — Deployment Guide

## Prerequisites
- Node.js 18+
- Supabase project (free tier works)
- Google Gemini API key (free tier)
- Groq API key (free tier, for Whisper)
- Vercel account

## Step 1: Supabase Setup

1. Create project at supabase.com
2. Go to **SQL Editor** and run the migration files in this exact order:
   - `001_schema.sql` - creates `profiles`, `students`, sessions, and the other base tables
   - `002_seed.sql` - adds learning content only
   - `003_privacy_consent_profile_fields.sql`
   - `004_hash_student_pins.sql`
   - `005_fix_profile_rls.sql`
   - `006_phone_auth_profiles.sql`
   - `007_username_auth.sql` - adds username storage and case-insensitive uniqueness
3. Run each file completely before running the next one. Do not run `007_username_auth.sql` by itself on a new Supabase project.
4. Go to **Settings → API** and copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public key` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role key` → `SUPABASE_SERVICE_ROLE_KEY`

## Step 2: API Keys

**Gemini (free):** https://makersuite.google.com/app/apikey
**Groq (free):** https://console.groq.com/keys

## Step 3: Environment Variables

Copy `.env.example` to `.env.local` and fill in all values.

## Step 4: Local Development

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Step 5: Deploy to Vercel

```bash
npx vercel --prod
```

Add all environment variables from `.env.local` in Vercel dashboard under **Settings → Environment Variables**.

## Step 6: Auth Setup (production)

In Supabase dashboard:
1. **Authentication → Email** → enable "Confirm email"
2. **Authentication → URL Configuration** → set Site URL to your Vercel URL
3. **Authentication → Redirect URLs** → add `https://your-domain.com/auth/callback`

## Supabase Auth Callback

Add this route for production auth:

`app/auth/callback/route.ts` — exchanges code for session.

## Edge Safety Notes

- All pages under `/teacher` and `/admin` use `export const dynamic = 'force-dynamic'`
- Middleware uses `@supabase/ssr` which is edge-compatible
- AI API keys are server-side only (route handlers, never client)

## Demo Mode

The app runs fully in demo mode without any API keys — using mock data and mock AI responses. Set up real Supabase + API keys when ready to go live.
