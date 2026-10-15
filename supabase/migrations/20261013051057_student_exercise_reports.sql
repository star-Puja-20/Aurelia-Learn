ALTER TABLE public.student_game_progress
  DROP CONSTRAINT IF EXISTS student_game_progress_game_id_check;

ALTER TABLE public.student_game_progress
  ADD CONSTRAINT student_game_progress_game_id_check
  CHECK (game_id IN ('alphabet', 'phonics', 'vocabulary', 'spelling', 'sentences', 'stories', 'listening', 'quiz', 'writing'));

CREATE TABLE public.student_exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL CHECK (game_id IN ('alphabet', 'phonics', 'vocabulary', 'spelling', 'sentences', 'stories', 'listening', 'quiz', 'writing')),
  learning_level TEXT NOT NULL CHECK (learning_level IN ('letter', 'word', 'sentence', 'story', 'conversation')),
  correct_answers SMALLINT NOT NULL CHECK (correct_answers >= 0),
  total_questions SMALLINT NOT NULL CHECK (total_questions > 0 AND total_questions >= correct_answers),
  exercise_breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_student_exercise_attempts_recent
  ON public.student_exercise_attempts (student_id, created_at DESC);

ALTER TABLE public.student_exercise_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.student_exercise_attempts FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.student_exercise_attempts TO service_role;
