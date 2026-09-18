import type { DBStudent, DBSession, DBTeacherNote, DBStudentProgress, DBUser, StudentCardData, DashboardStats } from './types'

// ─── Mock teacher ─────────────────────────────────────────────
export const MOCK_TEACHER: DBUser = {
  id: 'teacher_1',
  username: 'demo_teacher',
  role: 'teacher',
  full_name: 'Ms. Sarah Johnson',
  avatar_url: null,
  created_at: '2024-09-01T08:00:00Z',
  updated_at: '2024-09-01T08:00:00Z',
}

export const MOCK_ADMIN: DBUser = {
  id: 'admin_1',
  username: 'admin',
  role: 'administrator',
  full_name: 'Admin User',
  avatar_url: null,
  created_at: '2024-09-01T08:00:00Z',
  updated_at: '2024-09-01T08:00:00Z',
}

// Students are created by teachers and loaded from Supabase.
export const MOCK_STUDENTS: DBStudent[] = []

// ─── Mock sessions ────────────────────────────────────────────
export const MOCK_SESSIONS: DBSession[] = [
  {
    id: 'session_1',
    teacher_id: 'teacher_1',
    student_id: 'student_1',
    status: 'completed',
    level: 'word',
    ai_plan: '## Session Plan for Aisha\n\n**Focus:** Sight words – set 2\n\n1. Warm-up: Review 5 words from last session\n2. New words: *they, said, have, like, some*\n3. Activity: Word matching game\n4. Reading: Short sentence with new words\n5. Speaking: Use 3 new words in sentences',
    teacher_edits: null,
    quality_rating: 4,
    started_at: '2025-01-22T09:00:00Z',
    ended_at: '2025-01-22T09:45:00Z',
    created_at: '2025-01-22T08:50:00Z',
  },
  {
    id: 'session_2',
    teacher_id: 'teacher_1',
    student_id: 'student_2',
    status: 'completed',
    level: 'letter',
    ai_plan: '## Session Plan for Ben\n\n**Focus:** Letters M, N, O\n\n1. Sing the ABC song up to O\n2. Trace letters M, N, O\n3. Find objects starting with each letter\n4. Match letter to emoji (🌙, 🏕️, 🐙)',
    teacher_edits: 'Ben responds very well to the emoji matching – extend this activity',
    quality_rating: 5,
    started_at: '2025-01-21T10:00:00Z',
    ended_at: '2025-01-21T10:40:00Z',
    created_at: '2025-01-21T09:55:00Z',
  },
  {
    id: 'session_3',
    teacher_id: 'teacher_1',
    student_id: 'student_3',
    status: 'completed',
    level: 'sentence',
    ai_plan: '## Session Plan for Clara\n\n**Focus:** "I can ___" sentences\n\n1. Discuss action verbs: run, jump, swim, draw\n2. Build sentences together\n3. Clara writes 3 original sentences\n4. Read them aloud for pronunciation',
    teacher_edits: null,
    quality_rating: 3,
    started_at: '2025-01-20T14:00:00Z',
    ended_at: '2025-01-20T14:50:00Z',
    created_at: '2025-01-20T13:55:00Z',
  },
  {
    id: 'session_4',
    teacher_id: 'teacher_1',
    student_id: 'student_4',
    status: 'planned',
    level: 'story',
    ai_plan: null,
    teacher_edits: null,
    quality_rating: null,
    started_at: null,
    ended_at: null,
    created_at: '2025-01-23T08:00:00Z',
  },
  {
    id: 'session_5',
    teacher_id: 'teacher_1',
    student_id: 'student_1',
    status: 'completed',
    level: 'word',
    ai_plan: '## Session Plan for Aisha\n\n**Focus:** Colour words\n\n1. Flashcard review of colours\n2. Colour dictation exercise\n3. Draw and label 5 coloured objects',
    teacher_edits: null,
    quality_rating: 5,
    started_at: '2025-01-15T09:00:00Z',
    ended_at: '2025-01-15T09:40:00Z',
    created_at: '2025-01-15T08:55:00Z',
  },
]

// ─── Mock teacher notes ───────────────────────────────────────
export const MOCK_NOTES: DBTeacherNote[] = [
  {
    id: 'note_1',
    session_id: 'session_1',
    teacher_id: 'teacher_1',
    student_id: 'student_1',
    content: 'Aisha is making great progress with sight words. She remembered all 5 words from the previous session without any prompting. Struggling slightly with "said" – the irregular spelling confuses her. Will revisit next session.',
    created_at: '2025-01-22T09:50:00Z',
    updated_at: '2025-01-22T09:50:00Z',
  },
  {
    id: 'note_2',
    session_id: 'session_2',
    teacher_id: 'teacher_1',
    student_id: 'student_2',
    content: 'Ben is responding brilliantly to visual and emoji-based learning. Letter recognition for M, N, O is solid. His enthusiasm is infectious – he created his own emoji-letter cards! Consider introducing letter P, Q next.',
    created_at: '2025-01-21T10:45:00Z',
    updated_at: '2025-01-21T10:45:00Z',
  },
  {
    id: 'note_3',
    session_id: 'session_3',
    teacher_id: 'teacher_1',
    student_id: 'student_3',
    content: 'Clara was less focused today – seemed tired. Managed to form 2 out of 3 sentences independently. The "I can swim" sentence she wrote was perfect. Recommend shorter sessions for now and check in with parents about home routine.',
    created_at: '2025-01-20T14:55:00Z',
    updated_at: '2025-01-20T14:55:00Z',
  },
  {
    id: 'note_4',
    session_id: 'session_5',
    teacher_id: 'teacher_1',
    student_id: 'student_1',
    content: 'Excellent session! Aisha named all colour words instantly from flashcards. Drew a beautiful picture and correctly labelled red, blue, yellow, green, purple. She is ready to move into combined colour + noun vocabulary next session.',
    created_at: '2025-01-15T09:45:00Z',
    updated_at: '2025-01-15T09:45:00Z',
  },
]

// ─── Mock progress ────────────────────────────────────────────
export const MOCK_PROGRESS: DBStudentProgress[] = [
  { id: 'prog_1', student_id: 'student_1', content_id: 'content_word_1', status: 'completed', score: 92, attempts: 2, last_attempted_at: '2025-01-22T09:30:00Z', completed_at: '2025-01-22T09:30:00Z', created_at: '2025-01-10T00:00:00Z' },
  { id: 'prog_2', student_id: 'student_1', content_id: 'content_word_2', status: 'completed', score: 88, attempts: 3, last_attempted_at: '2025-01-15T09:20:00Z', completed_at: '2025-01-15T09:20:00Z', created_at: '2025-01-12T00:00:00Z' },
  { id: 'prog_3', student_id: 'student_1', content_id: 'content_word_3', status: 'in_progress', score: 60, attempts: 1, last_attempted_at: '2025-01-22T09:40:00Z', completed_at: null, created_at: '2025-01-22T00:00:00Z' },
  { id: 'prog_4', student_id: 'student_2', content_id: 'content_letter_1', status: 'completed', score: 95, attempts: 1, last_attempted_at: '2025-01-21T10:20:00Z', completed_at: '2025-01-21T10:20:00Z', created_at: '2025-01-15T00:00:00Z' },
  { id: 'prog_5', student_id: 'student_2', content_id: 'content_letter_2', status: 'in_progress', score: 75, attempts: 2, last_attempted_at: '2025-01-21T10:35:00Z', completed_at: null, created_at: '2025-01-21T00:00:00Z' },
  { id: 'prog_6', student_id: 'student_3', content_id: 'content_sentence_1', status: 'completed', score: 80, attempts: 2, last_attempted_at: '2025-01-20T14:30:00Z', completed_at: '2025-01-20T14:30:00Z', created_at: '2025-01-18T00:00:00Z' },
  { id: 'prog_7', student_id: 'student_3', content_id: 'content_sentence_2', status: 'struggling', score: 45, attempts: 4, last_attempted_at: '2025-01-20T14:45:00Z', completed_at: null, created_at: '2025-01-19T00:00:00Z' },
  { id: 'prog_8', student_id: 'student_4', content_id: 'content_story_1', status: 'in_progress', score: 70, attempts: 2, last_attempted_at: '2025-01-19T11:00:00Z', completed_at: null, created_at: '2025-01-17T00:00:00Z' },
  { id: 'prog_9', student_id: 'student_5', content_id: 'content_conv_1', status: 'completed', score: 98, attempts: 1, last_attempted_at: '2025-01-22T15:00:00Z', completed_at: '2025-01-22T15:00:00Z', created_at: '2025-01-20T00:00:00Z' },
]

// ─── Derived view models ──────────────────────────────────────
export function getStudentCards(teacherId: string): StudentCardData[] {
  return MOCK_STUDENTS
    .filter(s => s.teacher_id === teacherId)
    .map(student => {
      const studentSessions = MOCK_SESSIONS.filter(s => s.student_id === student.id && s.status === 'completed')
      const lastSession = studentSessions.sort((a, b) =>
        new Date(b.ended_at ?? 0).getTime() - new Date(a.ended_at ?? 0).getTime()
      )[0]
      const studentProgress = MOCK_PROGRESS.filter(p => p.student_id === student.id)
      const completed = studentProgress.filter(p => p.status === 'completed').length
      const total = Math.max(studentProgress.length, 1)

      return {
        id: student.id,
        fullName: student.full_name,
        avatarEmoji: student.avatar_emoji,
        avatarColor: student.avatar_color,
        currentLevel: student.current_level,
        lastSessionDate: lastSession?.ended_at ?? null,
        progressPercent: Math.round((completed / total) * 100),
        isActive: student.is_active,
      }
    })
}

export function getDashboardStats(teacherId: string): DashboardStats {
  const myStudents = MOCK_STUDENTS.filter(s => s.teacher_id === teacherId && s.is_active)
  const mySessions = MOCK_SESSIONS.filter(s => s.teacher_id === teacherId)
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const sessionsThisWeek = mySessions.filter(s =>
    s.status === 'completed' && s.ended_at && new Date(s.ended_at) > oneWeekAgo
  )
  const allProgress = MOCK_PROGRESS.filter(p =>
    myStudents.some(s => s.id === p.student_id)
  )
  const completed = allProgress.filter(p => p.status === 'completed').length
  const avgProgress = allProgress.length > 0
    ? Math.round((completed / allProgress.length) * 100)
    : 0

  return {
    totalStudents: myStudents.length,
    activeSessions: mySessions.filter(s => s.status === 'active').length,
    sessionsThisWeek: sessionsThisWeek.length,
    avgProgress,
  }
}
