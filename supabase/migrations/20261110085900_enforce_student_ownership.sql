-- A teacher may only attach sessions/notes to students they own.
-- Previously the policies checked teacher_id only, so a client using the anon key
-- could insert a row pointing at another teacher's student_id.
-- Service-role API routes bypass RLS and are unaffected (they already filter by teacher_id).

DROP POLICY IF EXISTS "sessions_teacher" ON public.sessions;
CREATE POLICY "sessions_teacher" ON public.sessions FOR ALL
  TO authenticated
  USING (teacher_id = (SELECT auth.uid()))
  WITH CHECK (
    teacher_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.teacher_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "notes_teacher" ON public.teacher_notes;
CREATE POLICY "notes_teacher" ON public.teacher_notes FOR ALL
  TO authenticated
  USING (teacher_id = (SELECT auth.uid()))
  WITH CHECK (
    teacher_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.teacher_id = (SELECT auth.uid())
    )
    AND (
      session_id IS NULL OR EXISTS (
        SELECT 1 FROM public.sessions x
        WHERE x.id = session_id AND x.teacher_id = (SELECT auth.uid())
      )
    )
  );

DROP POLICY IF EXISTS "students_teacher" ON public.students;
CREATE POLICY "students_teacher" ON public.students FOR ALL
  TO authenticated
  USING (teacher_id = (SELECT auth.uid()))
  WITH CHECK (teacher_id = (SELECT auth.uid()));
