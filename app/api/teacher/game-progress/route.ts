import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedTeacherWorkspace } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

const PRACTICE_SUGGESTIONS: Record<string, string> = {
  alphabet: 'Play a short letter and uppercase/lowercase matching round.',
  phonics: 'Practice hearing a sound and choosing its matching letter.',
  vocabulary: 'Try picture-to-word matching with familiar objects.',
  spelling: 'Build a few short words with letter tiles.',
  sentences: 'Arrange simple word cards into short sentences.',
  stories: 'Read a short story together and ask one recall question.',
  listening: 'Try a short listen-and-identify picture game.',
  quiz: 'Review a mixed-skill round at a comfortable pace.',
}

export async function GET() {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const admin = createAdminClient()
    const { data: requester, error: roleError } = await admin.from('profiles').select('role').eq('id', user.id).single()
    if (roleError) throw roleError

    let studentQuery = admin
      .from('students')
      .select('id, teacher_id, full_name, current_level, avatar_emoji, avatar_color, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
    if (requester.role !== 'administrator') studentQuery = studentQuery.eq('teacher_id', user.id)

    const { data: students, error: studentsError } = await studentQuery
    if (studentsError) throw studentsError
    const studentIds = (students ?? []).map((student) => student.id)

    if (!studentIds.length) return NextResponse.json({ students: [] })
    const [{ data: profiles, error: profileError }, { data: gameProgress, error: progressError }, { data: sessions, error: sessionError }] = await Promise.all([
      admin.from('student_learning_profiles').select('student_id, completed_levels, streak_days, last_played_on').in('student_id', studentIds),
      admin.from('student_game_progress').select('student_id, game_id, attempts, correct_answers, total_questions, best_accuracy, last_played_at').in('student_id', studentIds),
      admin.from('sessions').select('student_id, started_at, ended_at').eq('status', 'completed').in('student_id', studentIds),
    ])
    if (profileError) throw profileError
    if (progressError) throw progressError
    if (sessionError) throw sessionError

    const result = (students ?? []).map((student) => {
      const profile = profiles?.find((row) => row.student_id === student.id) ?? {
        student_id: student.id, completed_levels: 0, streak_days: 0, last_played_on: null,
      }
      const games = (gameProgress ?? []).filter((row) => row.student_id === student.id)
      const totalCorrect = games.reduce((sum, row) => sum + row.correct_answers, 0)
      const totalQuestions = games.reduce((sum, row) => sum + row.total_questions, 0)
      const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : null
      const weakestGame = [...games].filter((row) => row.total_questions > 0).sort((a, b) =>
        a.correct_answers / a.total_questions - b.correct_answers / b.total_questions
      )[0]
      const minutesSpent = (sessions ?? []).filter((row) => row.student_id === student.id).reduce((sum, row) => {
        if (!row.started_at || !row.ended_at) return sum
        const duration = new Date(row.ended_at).getTime() - new Date(row.started_at).getTime()
        return sum + (duration > 0 ? Math.round(duration / 60000) : 0)
      }, 0)

      const playedAt = games.map((row) => row.last_played_at).filter((value): value is string => Boolean(value)).sort()
      return {
        ...student,
        profile,
        accuracy,
        gameCount: games.reduce((sum, row) => sum + row.attempts, 0),
        minutesSpent,
        weakArea: weakestGame?.game_id ?? null,
        suggestion: weakestGame ? PRACTICE_SUGGESTIONS[weakestGame.game_id] : 'Start with a short, confidence-building game.',
        lastPlayedAt: playedAt[playedAt.length - 1] ?? null,
      }
    })

    return NextResponse.json({ students: result })
  } catch (error) {
    console.error('[Teacher game progress GET]', error)
    return NextResponse.json({ error: 'Unable to load student game progress.' }, { status: 500 })
  }
}
