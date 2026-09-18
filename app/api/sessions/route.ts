import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAuthenticatedTeacher } from '@/lib/server-auth'

const SESSION_COLUMNS = 'id, teacher_id, student_id, status, level, ai_plan, teacher_edits, quality_rating, started_at, ended_at, created_at'
const LEVELS = ['letter', 'word', 'sentence', 'story', 'conversation'] as const

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedTeacher()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const studentId = request.nextUrl.searchParams.get('studentId')
    const supabase = await createServerClient()
    let query = supabase
      .from('sessions')
      .select(SESSION_COLUMNS)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (studentId) query = query.eq('student_id', studentId)

    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ sessions: data ?? [] })
  } catch (error) {
    console.error('[Sessions GET]', error)
    return NextResponse.json({ error: 'Unable to load sessions' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedTeacher()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { studentId, level, status = 'planned', startedAt, endedAt, teacherEdits } = body
    if (typeof studentId !== 'string' || !LEVELS.includes(level) ||
      !['planned', 'active', 'completed', 'cancelled'].includes(status)) {
      return NextResponse.json({ error: 'Missing session details' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: student } = await admin
      .from('students')
      .select('id')
      .eq('id', studentId)
      .eq('teacher_id', user.id)
      .maybeSingle()
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })

    const { data: session, error } = await admin
      .from('sessions')
      .insert({
        teacher_id: user.id,
        student_id: studentId,
        status,
        level,
        teacher_edits: typeof teacherEdits === 'string' ? teacherEdits : null,
        started_at: typeof startedAt === 'string' ? startedAt : null,
        ended_at: typeof endedAt === 'string' ? endedAt : null,
      })
      .select(SESSION_COLUMNS)
      .single()

    if (error) throw error
    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('[Sessions POST]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save session' }, { status: 500 })
  }
}
