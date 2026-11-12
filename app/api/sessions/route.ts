import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAuthenticatedTeacherWorkspace } from '@/lib/server-auth'
import { isLevel, isUuid, parseIsoDate } from '@/lib/input-validation'
import { allowRequest } from '@/lib/rate-limit'

const MAX_PLAN_LENGTH = 20000
const SESSION_COLUMNS = 'id, teacher_id, student_id, status, level, ai_plan, teacher_edits, quality_rating, started_at, ended_at, created_at'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const studentId = request.nextUrl.searchParams.get('studentId')
    const supabase = await createServerClient()
    let query = supabase
      .from('sessions')
      .select(SESSION_COLUMNS)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (studentId) {
      if (!isUuid(studentId)) return NextResponse.json({ error: 'Invalid student' }, { status: 400 })
      query = query.eq('student_id', studentId)
    }

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
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (!allowRequest(`sessions-write:${user.id}`, 60, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await request.json()
    const { studentId, level, status = 'planned', startedAt, endedAt, teacherEdits, aiPlan } = body
    const started = startedAt == null ? null : parseIsoDate(startedAt)
    const ended = endedAt == null ? null : parseIsoDate(endedAt)
    if (!isUuid(studentId) || !isLevel(level) ||
      !['planned', 'active', 'completed', 'cancelled'].includes(status) ||
      (startedAt != null && !started) || (endedAt != null && !ended) ||
      (teacherEdits != null && (typeof teacherEdits !== 'string' || teacherEdits.length > MAX_PLAN_LENGTH)) ||
      (aiPlan != null && (typeof aiPlan !== 'string' || aiPlan.length > MAX_PLAN_LENGTH))) {
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
        ai_plan: typeof aiPlan === 'string' ? aiPlan : null,
        teacher_edits: typeof teacherEdits === 'string' ? teacherEdits : null,
        started_at: started,
        ended_at: ended,
      })
      .select(SESSION_COLUMNS)
      .single()

    if (error) throw error
    return NextResponse.json({ session }, { status: 201 })
  } catch (error) {
    console.error('[Sessions POST]', error)
    return NextResponse.json({ error: 'Unable to save session' }, { status: 500 })
  }
}

// Complete a session, rate it, or save the AI plan and the teacher's edits to it.
export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    if (!allowRequest(`sessions-write:${user.id}`, 60, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { sessionId, status, endedAt, qualityRating, teacherEdits, aiPlan } = body
    const updates: Record<string, unknown> = {}

    if (!isUuid(sessionId)) return NextResponse.json({ error: 'Invalid session' }, { status: 400 })
    if (status !== undefined) {
      if (typeof status !== 'string' || !['planned', 'active', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updates.status = status
    }
    if (endedAt !== undefined) {
      const ended = parseIsoDate(endedAt)
      if (!ended) return NextResponse.json({ error: 'Invalid end time' }, { status: 400 })
      updates.ended_at = ended
    }
    if (qualityRating !== undefined) {
      if (!Number.isInteger(qualityRating) || (qualityRating as number) < 1 || (qualityRating as number) > 5) {
        return NextResponse.json({ error: 'Invalid rating' }, { status: 400 })
      }
      updates.quality_rating = qualityRating
    }
    for (const [key, column, value] of [['teacherEdits', 'teacher_edits', teacherEdits], ['aiPlan', 'ai_plan', aiPlan]] as const) {
      if (value === undefined) continue
      if (typeof value !== 'string' || value.length > MAX_PLAN_LENGTH) {
        return NextResponse.json({ error: `Invalid ${key}` }, { status: 400 })
      }
      updates[column] = value
    }
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 })

    const supabase = await createServerClient()
    const { data: session, error } = await supabase
      .from('sessions')
      .update(updates)
      .eq('id', sessionId)
      .eq('teacher_id', user.id)
      .select(SESSION_COLUMNS)
      .maybeSingle()

    if (error) throw error
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    return NextResponse.json({ session })
  } catch (error) {
    console.error('[Sessions PATCH]', error)
    return NextResponse.json({ error: 'Unable to update session' }, { status: 500 })
  }
}
