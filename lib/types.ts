// ============================================================
// Aurelia Learn – Full TypeScript Type Definitions
// ============================================================

export type UserRole = 'administrator' | 'teacher'

export type LearningLevel = 'letter' | 'word' | 'sentence' | 'story' | 'conversation'

export type SessionStatus = 'planned' | 'active' | 'completed' | 'cancelled'

export type ProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'struggling'

// ─── Database row types ─────────────────────────────────────

export interface DBUser {
  id: string
  email: string | null
  role: UserRole
  full_name: string
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface DBStudent {
  id: string
  teacher_id: string
  full_name: string
  pin: string               // 4-digit, stored hashed in prod
  current_level: LearningLevel
  avatar_emoji: string
  avatar_color: string      // hex colour for avatar background
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface DBLearningContent {
  id: string
  level: LearningLevel
  title: string
  content: Record<string, unknown>
  order_index: number
  created_at: string
}

export interface DBStudentProgress {
  id: string
  student_id: string
  content_id: string
  status: ProgressStatus
  score: number | null       // 0–100
  attempts: number
  last_attempted_at: string | null
  completed_at: string | null
  created_at: string
}

export interface DBSession {
  id: string
  teacher_id: string
  student_id: string
  status: SessionStatus
  level: LearningLevel
  ai_plan: string | null     // Gemini-generated markdown plan
  teacher_edits: string | null
  quality_rating: number | null  // 1–5 post-session rating
  started_at: string | null
  ended_at: string | null
  created_at: string
}

export interface DBTeacherNote {
  id: string
  session_id: string
  teacher_id: string
  student_id: string
  content: string
  created_at: string
  updated_at: string
}

// ─── Extended / joined types ─────────────────────────────────

export interface StudentWithProgress extends DBStudent {
  progress: DBStudentProgress[]
  sessions: DBSession[]
  notes: DBTeacherNote[]
  teacher?: DBUser
}

export interface SessionWithDetails extends DBSession {
  student: DBStudent
  teacher: DBUser
  notes: DBTeacherNote[]
}

// ─── UI / view model types ───────────────────────────────────

export interface StudentCardData {
  id: string
  fullName: string
  avatarEmoji: string
  avatarColor: string
  currentLevel: LearningLevel
  lastSessionDate: string | null
  progressPercent: number
  isActive: boolean
}

export interface DashboardStats {
  totalStudents: number
  activeSessions: number
  sessionsThisWeek: number
  avgProgress: number
}

export interface LevelConfig {
  key: LearningLevel
  label: string
  description: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  order: number
}

// ─── Auth types ──────────────────────────────────────────────

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  fullName: string
}

// ─── AI types ────────────────────────────────────────────────

export interface AIPlanRequest {
  studentId: string
  level: LearningLevel
  sessionHistory: DBSession[]
  teacherNotes: DBTeacherNote[]
  studentProgress: DBStudentProgress[]
}

export interface AIInsight {
  type: 'concern' | 'progress' | 'suggestion'
  message: string
  studentId?: string
}
