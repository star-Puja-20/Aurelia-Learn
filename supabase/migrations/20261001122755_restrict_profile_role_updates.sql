DROP POLICY IF EXISTS "profiles_self" ON public.profiles;

CREATE POLICY "profiles_self_select" ON public.profiles FOR SELECT
	TO authenticated
	USING ((SELECT auth.uid()) = id);
