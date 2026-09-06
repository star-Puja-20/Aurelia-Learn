-- Avoid recursive RLS evaluation when checking administrator access.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'administrator'
  );
$$;

DROP POLICY IF EXISTS "profiles_admin" ON public.profiles;
DROP POLICY IF EXISTS "students_admin" ON public.students;
DROP POLICY IF EXISTS "sessions_admin" ON public.sessions;
DROP POLICY IF EXISTS "progress_admin" ON public.student_progress;

CREATE POLICY "profiles_admin" ON public.profiles FOR SELECT
  USING (public.is_admin());
CREATE POLICY "students_admin" ON public.students FOR SELECT
  USING (public.is_admin());
CREATE POLICY "sessions_admin" ON public.sessions FOR SELECT
  USING (public.is_admin());
CREATE POLICY "progress_admin" ON public.student_progress FOR SELECT
  USING (public.is_admin());
