-- Aurelia Learn — Full Schema + RLS

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── Users (extends Supabase auth.users) ──────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT NOT NULL DEFAULT '',
  role          TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher', 'administrator')),
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Students ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.students (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name      TEXT NOT NULL,
  pin            TEXT NOT NULL,          -- stored hashed in production
  current_level  TEXT NOT NULL DEFAULT 'letter'
                   CHECK (current_level IN ('letter','word','sentence','story','conversation')),
  avatar_emoji   TEXT NOT NULL DEFAULT '⭐',
  avatar_color   TEXT NOT NULL DEFAULT '#4FC3F7',
  is_active      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Learning content ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.learning_content (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  level        TEXT NOT NULL CHECK (level IN ('letter','word','sentence','story','conversation')),
  title        TEXT NOT NULL,
  content      JSONB NOT NULL DEFAULT '{}',
  order_index  INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Sessions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.sessions (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id      UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  status          TEXT NOT NULL DEFAULT 'planned'
                    CHECK (status IN ('planned','active','completed','cancelled')),
  level           TEXT NOT NULL CHECK (level IN ('letter','word','sentence','story','conversation')),
  ai_plan         TEXT,
  teacher_edits   TEXT,
  quality_rating  INTEGER CHECK (quality_rating BETWEEN 1 AND 5),
  started_at      TIMESTAMPTZ,
  ended_at        TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Teacher notes ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.teacher_notes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id  UUID REFERENCES public.sessions(id) ON DELETE SET NULL,
  teacher_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Student progress ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.student_progress (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id        UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  content_id        UUID REFERENCES public.learning_content(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'not_started'
                      CHECK (status IN ('not_started','in_progress','completed','struggling')),
  score             INTEGER CHECK (score BETWEEN 0 AND 100),
  attempts          INTEGER NOT NULL DEFAULT 0,
  last_attempted_at TIMESTAMPTZ,
  completed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── Indexes ──────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_students_teacher ON public.students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_teacher ON public.sessions(teacher_id);
CREATE INDEX IF NOT EXISTS idx_sessions_student ON public.sessions(student_id);
CREATE INDEX IF NOT EXISTS idx_notes_student    ON public.teacher_notes(student_id);
CREATE INDEX IF NOT EXISTS idx_progress_student ON public.student_progress(student_id);

-- ─── Updated_at trigger ───────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated   BEFORE UPDATE ON public.profiles   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_students_updated   BEFORE UPDATE ON public.students   FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trg_notes_updated      BEFORE UPDATE ON public.teacher_notes FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────
ALTER TABLE public.profiles         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teacher_notes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_content ENABLE ROW LEVEL SECURITY;

-- Profiles: users see only their own; admins see all
CREATE POLICY "profiles_self"  ON public.profiles FOR ALL
  USING (auth.uid() = id);
CREATE POLICY "profiles_admin" ON public.profiles FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'administrator'));

-- Students: teacher sees only their own; admins read all
CREATE POLICY "students_teacher" ON public.students FOR ALL
  USING (teacher_id = auth.uid());
CREATE POLICY "students_admin"   ON public.students FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'administrator'));

-- Sessions: teacher owns; admins read
CREATE POLICY "sessions_teacher" ON public.sessions FOR ALL
  USING (teacher_id = auth.uid());
CREATE POLICY "sessions_admin"   ON public.sessions FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'administrator'));

-- Notes: teacher owns only
CREATE POLICY "notes_teacher" ON public.teacher_notes FOR ALL
  USING (teacher_id = auth.uid());

-- Progress: teacher sees students they own
CREATE POLICY "progress_teacher" ON public.student_progress FOR ALL
  USING (EXISTS (SELECT 1 FROM public.students WHERE id = student_progress.student_id AND teacher_id = auth.uid()));
CREATE POLICY "progress_admin" ON public.student_progress FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'administrator'));

-- Learning content: readable by all authenticated users
CREATE POLICY "content_read" ON public.learning_content FOR SELECT
  USING (auth.role() = 'authenticated');
