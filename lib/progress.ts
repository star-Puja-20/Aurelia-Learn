import type { DBExerciseResult, DBSession, DBStudent, DashboardStats, LearningLevel, StudentCardData } from './types'
import { setIdsForLevel } from './exercises'

// A set counts as completed once the student has scored at least this much on it.
export const PASS_SCORE = 60
// A session left "active" for longer than this is treated as finished for dashboard counts.
const ACTIVE_SESSION_MAX_MS = 3 * 60 * 60 * 1000

export function bestScoreBySet(results: DBExerciseResult[]) {
  const best = new Map<string, number>()
  for (const result of results) {
    best.set(result.exercise_id, Math.max(best.get(result.exercise_id) ?? 0, result.score))
  }
  return best
}

export function levelProgress(results: DBExerciseResult[], level: LearningLevel) {
  const ids = setIdsForLevel(level)
  const levelResults = results.filter(result => result.level === level)
  const best = bestScoreBySet(levelResults)
  const completedSets = ids.filter(id => (best.get(id) ?? 0) >= PASS_SCORE).length
  const avgScore = levelResults.length
    ? Math.round(levelResults.reduce((sum, result) => sum + result.score, 0) / levelResults.length)
    : 0
  return {
    level,
    completedSets,
    totalSets: ids.length,
    percent: Math.round((completedSets / ids.length) * 100),
    attempts: levelResults.length,
    avgScore,
  }
}

export function averageScore(results: DBExerciseResult[]) {
  return results.length ? Math.round(results.reduce((sum, result) => sum + result.score, 0) / results.length) : 0
}

export function isSessionActive(session: DBSession, now = Date.now()) {
  if (session.status !== 'active') return false
  const started = new Date(session.started_at ?? session.created_at).getTime()
  return now - started < ACTIVE_SESSION_MAX_MS
}

export function buildStudentCards(students: DBStudent[], sessions: DBSession[], results: DBExerciseResult[]): StudentCardData[] {
  return students.map(student => {
    const mine = results.filter(result => result.student_id === student.id)
    const lastCompleted = sessions
      .filter(session => session.student_id === student.id && session.status === 'completed')
      .sort((a, b) => new Date(b.ended_at ?? b.created_at).getTime() - new Date(a.ended_at ?? a.created_at).getTime())[0]
    return {
      id: student.id,
      fullName: student.full_name,
      avatarEmoji: student.avatar_emoji,
      avatarColor: student.avatar_color,
      currentLevel: student.current_level,
      lastSessionDate: lastCompleted ? (lastCompleted.ended_at ?? lastCompleted.created_at) : null,
      progressPercent: levelProgress(mine, student.current_level).percent,
      isActive: student.is_active,
    }
  })
}

export function buildDashboardStats(students: DBStudent[], sessions: DBSession[], cards: StudentCardData[]): DashboardStats {
  const active = students.filter(student => student.is_active)
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const sessionsThisWeek = sessions.filter(session =>
    session.status === 'completed' && new Date(session.ended_at ?? session.created_at).getTime() > weekAgo,
  ).length
  const activeCards = cards.filter(card => card.isActive)
  return {
    totalStudents: active.length,
    activeSessions: sessions.filter(session => isSessionActive(session)).length,
    sessionsThisWeek,
    avgProgress: activeCards.length
      ? Math.round(activeCards.reduce((sum, card) => sum + card.progressPercent, 0) / activeCards.length)
      : 0,
  }
}
