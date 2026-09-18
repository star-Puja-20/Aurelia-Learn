-- Username-only application accounts. Supabase Auth keeps the password hash internally.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS username TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique
  ON public.profiles (LOWER(username))
  WHERE username IS NOT NULL;

ALTER TABLE public.profiles
  ALTER COLUMN email DROP NOT NULL;
