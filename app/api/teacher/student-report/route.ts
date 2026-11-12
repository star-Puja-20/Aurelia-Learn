import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedTeacherWorkspace } from '@/lib/server-auth'

export const dynamic = 'force-dynamic'

const TYPE_LABELS: Record<string, string> = {
  missing_letter: 'Missing letters',
  missing_word: 'Missing words',
  sentence_completion: 'Sentence completion',
  story_cloze: 'Story words',
  dialogue_completion: 'Dialogue completion',
  game_question: 'Other game questions',
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const studentId = request.nextUrl.searchParams.get('studentId')
    if (!studentId) return NextResponse.json({ error: 'Student is required.' }, { status: 400 })

    const admin = createAdminClient()
    const [{ data: requester, error: roleError }, { data: student, error: studentError }] = await Promise.all([
      admin.from('profiles').select('role').eq('id', user.id).single(),
      admin.from('students').select('id, teacher_id, full_name, current_level').eq('id', studentId).maybeSingle(),
    ])
    if (roleError) throw roleError
    if (studentError) throw studentError
    if (!student || (requester.role !== 'administrator' && student.teacher_id !== user.id)) {
      return NextResponse.json({ error: 'Student not found.' }, { status: 404 })
    }

    const { data: attempts, error: attemptsError } = await admin
      .from('student_exercise_attempts')
      .select('id, game_id, learning_level, correct_answers, total_questions, exercise_breakdown, created_at')
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(30)
    if (attemptsError) throw attemptsError

    const categoryTotals = new Map<string, { correct: number; total: number }>()
    for (const attempt of attempts ?? []) {
      for (const part of Array.isArray(attempt.exercise_breakdown) ? attempt.exercise_breakdown : []) {
        if (!part || typeof part.type !== 'string' || typeof part.correct !== 'number' || typeof part.total !== 'number') continue
        const current = categoryTotals.get(part.type) ?? { correct: 0, total: 0 }
        current.correct += part.correct
        current.total += part.total
        categoryTotals.set(part.type, current)
      }
    }

    const exerciseSummary = Array.from(categoryTotals.entries()).map(([type, totals]) => ({
      type,
      label: TYPE_LABELS[type] ?? type.replace(/_/g, ' '),
      ...totals,
      accuracy: totals.total ? Math.round((totals.correct / totals.total) * 100) : 0,
    })).sort((a, b) => a.accuracy - b.accuracy)

    const chronologicalAttempts = [...(attempts ?? [])].reverse()
    const rounds = chronologicalAttempts.slice(-12).map((attempt, index) => ({
      index: index + 1,
      date: attempt.created_at,
      accuracy: Math.round((attempt.correct_answers / attempt.total_questions) * 100),
      gameId: attempt.game_id,
      level: attempt.learning_level,
    }))
    const writtenSummary = exerciseSummary.filter((item) => item.type !== 'game_question')
    const weakest = writtenSummary[0]
    const recommendation = !writtenSummary.length
      ? 'There is not enough written-exercise history yet. Run a Word Workshop round to start this review.'
      : weakest && weakest.accuracy < 80
        ? `Review ${weakest.label.toLowerCase()} with a short guided activity (${weakest.accuracy}% accuracy so far).`
        : 'Written exercises are going well. Try a slightly more open-ended activity and check understanding as the student explains their answer.'

    return NextResponse.json({
      student: { id: student.id, name: student.full_name, level: student.current_level },
      attempts: attempts ?? [],
      exerciseSummary,
      rounds,
      recommendation,
      totalRounds: attempts?.length ?? 0,
    })
  } catch (error) {
    console.error('[Teacher student report GET]', error)
    return NextResponse.json({ error: 'Unable to load this student’s learning review.' }, { status: 500 })
  }
}
