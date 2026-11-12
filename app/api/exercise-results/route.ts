import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAuthenticatedTeacherWorkspace } from '@/lib/server-auth'
import { isLevel, isUuid } from '@/lib/input-validation'
import { allowRequest } from '@/lib/rate-limit'
import { ALL_RESULT_EXERCISE_IDS } from '@/lib/exercises'

const COLUMNS = 'id, teacher_id, student_id, session_id, level, skill, exercise_id, score, correct, total, created_at'
const SKILLS = ['learn', 'reading', 'listening', 'written']

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const studentId = request.nextUrl.searchParams.get('studentId')
    const supabase = await createServerClient()
    let query = supabase
      .from('exercise_results')
      .select(COLUMNS)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })
      .limit(2000)

    if (studentId) {
      if (!isUuid(studentId)) return NextResponse.json({ error: 'Invalid student' }, { status: 400 })
      query = query.eq('student_id', studentId)
    }

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ results: data ?? [] })
  } catch (error) {
    console.error('[ExerciseResults GET]', error)
    return NextResponse.json({ error: 'Unable to load results' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (!allowRequest(`results-write:${user.id}`, 120, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { studentId, sessionId, level, skill, exerciseId, score, correct, total } = body
    const isCount = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 100
    if (!isUuid(studentId) || !isLevel(level) || typeof skill !== 'string' || !SKILLS.includes(skill) ||
      typeof exerciseId !== 'string' || !ALL_RESULT_EXERCISE_IDS.has(exerciseId) ||
      !isCount(score) || !isCount(correct) || !isCount(total) || correct > total ||
      (sessionId != null && !isUuid(sessionId))) {
      return NextResponse.json({ error: 'Invalid result' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('id', studentId)
      .eq('teacher_id', user.id)
      .maybeSingle()
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    if (sessionId) {
      const { data: session } = await supabase
        .from('sessions')
        .select('id')
        .eq('id', sessionId)
        .eq('teacher_id', user.id)
        .eq('student_id', studentId)
        .maybeSingle()
      if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const { data, error } = await supabase
      .from('exercise_results')
      .insert({
        teacher_id: user.id,
        student_id: studentId,
        session_id: sessionId ?? null,
        level,
        skill,
        exercise_id: exerciseId,
        score,
        correct,
        total,
      })
      .select(COLUMNS)
      .single()

    if (error) throw error
    return NextResponse.json({ result: data }, { status: 201 })
  } catch (error) {
    console.error('[ExerciseResults POST]', error)
    return NextResponse.json({ error: 'Unable to save result' }, { status: 500 })
  }
}
