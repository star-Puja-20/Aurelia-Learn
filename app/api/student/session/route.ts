import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStudentIdFromCookie } from '@/lib/student-session'

export const dynamic = 'force-dynamic'

const EMPTY_PROFILE = {
  completed_levels: 0,
  streak_days: 0,
  last_played_on: null,
}

export async function GET() {
  try {
    const studentId = await getStudentIdFromCookie()
    if (!studentId) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

    const admin = createAdminClient()
    const { data: student, error: studentError } = await admin
      .from('students')
      .select('id, full_name, current_level, avatar_emoji, avatar_color, is_active')
      .eq('id', studentId)
      .eq('is_active', true)
      .maybeSingle()
    if (studentError) throw studentError
    if (!student) return NextResponse.json({ error: 'This learner profile is no longer active.' }, { status: 401 })

    const { error: initializeError } = await admin
      .from('student_learning_profiles')
      .upsert({ student_id: student.id }, { onConflict: 'student_id', ignoreDuplicates: true })
    if (initializeError) throw initializeError

    const [{ data: profile, error: profileError }, { data: gameRows, error: gamesError }] = await Promise.all([
      admin.from('student_learning_profiles').select('completed_levels, streak_days, last_played_on').eq('student_id', student.id).single(),
      admin.from('student_game_progress').select('game_id, attempts, correct_answers, total_questions, best_accuracy').eq('student_id', student.id),
    ])
    if (profileError) throw profileError
    if (gamesError) throw gamesError

    const gameProgress = Object.fromEntries((gameRows ?? []).map((row) => [
      row.game_id,
      {
        attempts: row.attempts,
        accuracy: row.total_questions ? Math.round((row.correct_answers / row.total_questions) * 100) : 0,
        bestAccuracy: row.best_accuracy ?? 0,
      },
    ]))

    return NextResponse.json({ student, profile: profile ?? EMPTY_PROFILE, gameProgress })
  } catch (error) {
    console.error('[Student session GET]', error)
    return NextResponse.json({ error: 'Unable to load your learning profile.' }, { status: 500 })
  }
}
