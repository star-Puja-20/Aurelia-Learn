-- Defence in depth for database access from the browser (anon / authenticated keys).
-- The server API routes use the service-role key, which bypasses these rules, so the app keeps working.

-- 1. Profiles are read-only for signed-in users. Only the server (service role) creates or changes them,
--    so nobody can sign up directly against Supabase Auth and grant themselves the administrator role.
DROP POLICY IF EXISTS "profiles_self" ON public.profiles;
DROP POLICY IF EXISTS "profiles_self_select" ON public.profiles;
CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;

-- 2. Signed-out visitors never need direct table access.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;

-- Student PIN columns are removed by the earlier
-- 20261015052222_remove_student_pin_columns.sql migration.
