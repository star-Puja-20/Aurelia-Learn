-- Results of the reading / listening / written / learn activities a student completes in a session.
CREATE TABLE IF NOT EXISTS public.exercise_results (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id   UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  session_id   UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  level        TEXT NOT NULL CHECK (level IN ('letter','word','sentence','story','conversation')),
  skill        TEXT NOT NULL CHECK (skill IN ('learn','reading','listening','written')),
  exercise_id  TEXT NOT NULL CHECK (char_length(exercise_id) BETWEEN 3 AND 60),
  score        INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  correct      INTEGER NOT NULL DEFAULT 0 CHECK (correct BETWEEN 0 AND 100),
  total        INTEGER NOT NULL DEFAULT 0 CHECK (total BETWEEN 0 AND 100),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_exercise_results_student ON public.exercise_results(student_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_exercise_results_teacher ON public.exercise_results(teacher_id, created_at DESC);

ALTER TABLE public.exercise_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "results_teacher" ON public.exercise_results;
CREATE POLICY "results_teacher" ON public.exercise_results FOR ALL
  TO authenticated
  USING (teacher_id = (SELECT auth.uid()))
  WITH CHECK (
    teacher_id = (SELECT auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.students s
      WHERE s.id = student_id AND s.teacher_id = (SELECT auth.uid())
    )
  );

DROP POLICY IF EXISTS "results_admin" ON public.exercise_results;
CREATE POLICY "results_admin" ON public.exercise_results FOR SELECT
  TO authenticated
  USING (public.is_admin());
