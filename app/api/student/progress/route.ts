import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getStudentIdFromCookie } from '@/lib/student-session'

const GAME_IDS = ['alphabet', 'phonics', 'vocabulary', 'spelling', 'sentences', 'stories', 'listening', 'quiz']
const LEVEL_LIMIT = 8 * 3

export async function POST(request: NextRequest) {
  try {
    const studentId = await getStudentIdFromCookie()
    if (!studentId) return NextResponse.json({ error: 'Please sign in again.' }, { status: 401 })

    const body = await request.json()
    const gameId = typeof body.gameId === 'string' ? body.gameId : ''
    const answers: unknown = body.answers
    if (!GAME_IDS.includes(gameId) || !Array.isArray(answers) || answers.length < 1 || answers.length > 20 ||
      !answers.every((answer) => typeof answer === 'boolean')) {
      return NextResponse.json({ error: 'Invalid game result.' }, { status: 400 })
    }

    const answerResults = answers as boolean[]
    const correctNow = answerResults.filter(Boolean).length
    const accuracyNow = Math.round((correctNow / answerResults.length) * 100)
    const admin = createAdminClient()
    const [{ data: previousGame, error: gameReadError }, { data: previousProfile, error: profileReadError }] = await Promise.all([
      admin.from('student_game_progress').select('attempts, correct_answers, total_questions, best_accuracy').eq('student_id', studentId).eq('game_id', gameId).maybeSingle(),
      admin.from('student_learning_profiles').select('completed_levels, streak_days, last_played_on').eq('student_id', studentId).maybeSingle(),
    ])
    if (gameReadError) throw gameReadError
    if (profileReadError) throw profileReadError

    const { error: studentError } = await admin.from('students').select('id').eq('id', studentId).eq('is_active', true).single()
    if (studentError) return NextResponse.json({ error: 'This learner profile is no longer active.' }, { status: 401 })

    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    const yesterday = new Date(now.getTime() - 86400000).toISOString().slice(0, 10)
    const nextAttempts = (previousGame?.attempts ?? 0) + 1
    const totalQuestions = (previousGame?.total_questions ?? 0) + answerResults.length
    const correctAnswers = (previousGame?.correct_answers ?? 0) + correctNow
    const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
    const { error: gameWriteError } = await admin.from('student_game_progress').upsert({
      student_id: studentId,
      game_id: gameId,
      attempts: nextAttempts,
      correct_answers: correctAnswers,
      total_questions: totalQuestions,
      best_accuracy: Math.max(previousGame?.best_accuracy ?? 0, accuracyNow),
      last_played_at: now.toISOString(),
    }, { onConflict: 'student_id,game_id' })
    if (gameWriteError) throw gameWriteError

    const lastPlayed = previousProfile?.last_played_on
    const streakDays = lastPlayed === today ? (previousProfile?.streak_days ?? 0)
      : lastPlayed === yesterday ? (previousProfile?.streak_days ?? 0) + 1
      : 1
    const profile = {
      student_id: studentId,
      completed_levels: Math.min((previousProfile?.completed_levels ?? 0) + 1, LEVEL_LIMIT),
      streak_days: streakDays,
      last_played_on: today,
      updated_at: now.toISOString(),
    }
    const { error: profileWriteError } = await admin.from('student_learning_profiles').upsert(profile, { onConflict: 'student_id' })
    if (profileWriteError) throw profileWriteError

    return NextResponse.json({
      profile: {
        completed_levels: profile.completed_levels,
        streak_days: profile.streak_days,
        last_played_on: profile.last_played_on,
      },
      gameProgress: {
        attempts: nextAttempts,
        accuracy,
        bestAccuracy: Math.max(previousGame?.best_accuracy ?? 0, accuracyNow),
      },
    })
  } catch (error) {
    console.error('[Student progress POST]', error)
    return NextResponse.json({ error: 'Unable to save your progress right now.' }, { status: 500 })
  }
}
