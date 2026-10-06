CREATE TABLE public.student_learning_profiles (
  student_id UUID PRIMARY KEY REFERENCES public.students(id) ON DELETE CASCADE,
  xp INTEGER NOT NULL DEFAULT 0 CHECK (xp >= 0),
  coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
  completed_levels SMALLINT NOT NULL DEFAULT 0 CHECK (completed_levels BETWEEN 0 AND 24),
  streak_days INTEGER NOT NULL DEFAULT 0 CHECK (streak_days >= 0),
  last_played_on DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.student_game_progress (
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL CHECK (
    game_id IN ('alphabet', 'phonics', 'vocabulary', 'spelling', 'sentences', 'stories', 'listening', 'quiz')
  ),
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  correct_answers INTEGER NOT NULL DEFAULT 0 CHECK (correct_answers >= 0),
  total_questions INTEGER NOT NULL DEFAULT 0 CHECK (total_questions >= correct_answers),
  best_accuracy SMALLINT CHECK (best_accuracy BETWEEN 0 AND 100),
  last_played_at TIMESTAMPTZ,
  PRIMARY KEY (student_id, game_id)
);

CREATE INDEX idx_students_full_name_active ON public.students (full_name, is_active);

ALTER TABLE public.student_learning_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_game_progress ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.student_learning_profiles FROM anon, authenticated;
REVOKE ALL ON TABLE public.student_game_progress FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.student_learning_profiles TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.student_game_progress TO service_role;
GRANT SELECT ON TABLE public.student_learning_profiles TO authenticated;
GRANT SELECT ON TABLE public.student_game_progress TO authenticated;

CREATE POLICY "Teachers can read their students' learning profiles"
  ON public.student_learning_profiles FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = student_learning_profiles.student_id
        AND students.teacher_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'administrator'
    )
  );

CREATE POLICY "Teachers can read their students' game progress"
  ON public.student_game_progress FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.students
      WHERE students.id = student_game_progress.student_id
        AND students.teacher_id = (SELECT auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = (SELECT auth.uid())
        AND profiles.role = 'administrator'
    )
  );