import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAuthenticatedTeacherWorkspace } from '@/lib/server-auth'
import { isUuid } from '@/lib/input-validation'
import { allowRequest } from '@/lib/rate-limit'

const COLUMNS = 'id, session_id, teacher_id, student_id, content, created_at, updated_at'

// Notes are private: every query is limited to the signed-in teacher's own rows.
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const studentId = request.nextUrl.searchParams.get('studentId')
    if (!isUuid(studentId)) return NextResponse.json({ error: 'Invalid student' }, { status: 400 })

    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('teacher_notes')
      .select(COLUMNS)
      .eq('teacher_id', user.id)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })
      .limit(500)

    if (error) throw error
    return NextResponse.json({ notes: data ?? [] })
  } catch (error) {
    console.error('[Notes GET]', error)
    return NextResponse.json({ error: 'Unable to load notes' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (!allowRequest(`notes-write:${user.id}`, 30, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { studentId, sessionId, content } = body
    if (!isUuid(studentId) || typeof content !== 'string' || content.trim().length < 1 || content.length > 4000 ||
      (sessionId != null && !isUuid(sessionId))) {
      return NextResponse.json({ error: 'Invalid note' }, { status: 400 })
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
      .from('teacher_notes')
      .insert({ teacher_id: user.id, student_id: studentId, session_id: sessionId ?? null, content: content.trim() })
      .select(COLUMNS)
      .single()

    if (error) throw error
    return NextResponse.json({ note: data }, { status: 201 })
  } catch (error) {
    console.error('[Notes POST]', error)
    return NextResponse.json({ error: 'Unable to save note' }, { status: 500 })
  }
}
